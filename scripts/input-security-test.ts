/**
 * Input Security Test (Live Supabase)
 * ---------------------------------------------------------------------------
 * Tests S1-S6 from docs/input-security-test-report plan:
 * - Seed customer logins + permission flags
 * - request_id / client_id mismatch
 * - duplicate submit after status=submitted
 * - can_view_inputs=false
 * - storage isolation + permission bypass
 * - submitted_by binding
 *
 * Run:
 *   npm run test:input-security
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_ROLE_KEY) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

type Result = "PASS" | "FAIL" | "LEAK" | "ERROR" | "INFO";
type CaseResult = { id: string; result: Result; detail: string; severity?: string };

const results: CaseResult[] = [];
const cleanupSubmissionIds: string[] = [];
const cleanupStoragePaths: string[] = [];

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const adminPortal = admin.schema("portal");

const SEED_USERS = [
  {
    slug: "test-vollzugriff",
    email: "test-vollzugriff@rais.invalid",
    password: "RAIS-test-test-vollzugriff",
    canViewReports: true,
    canViewInputs: true,
  },
  {
    slug: "test-nur-reports",
    email: "test-nur-reports@rais.invalid",
    password: "RAIS-test-test-nur-reports",
    canViewReports: true,
    canViewInputs: false,
  },
  {
    slug: "test-nur-inputs",
    email: "test-nur-inputs@rais.invalid",
    password: "RAIS-test-test-nur-inputs",
    canViewReports: false,
    canViewInputs: true,
  },
] as const;

function record(id: string, result: Result, detail: string, severity?: string) {
  results.push({ id, result, detail, severity });
  console.log(`[${result}] ${id}: ${detail}`);
}

async function signInAs(email: string, password: string): Promise<SupabaseClient | null> {
  const client = createClient(SUPABASE_URL!, ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    record("LOGIN", "ERROR", `${email}: ${error.message}`);
    return null;
  }
  return client;
}

async function getSeedContext(slug: string) {
  const { data: clientRow } = await adminPortal.from("clients").select("id,name,slug").eq("slug", slug).maybeSingle();
  if (!clientRow) return null;

  const { data: userRow } = await adminPortal
    .from("client_users")
    .select("user_id,can_view_reports,can_view_inputs")
    .eq("client_id", clientRow.id)
    .limit(1)
    .maybeSingle();

  const { data: openRequest } = await adminPortal
    .from("input_requests")
    .select("id,title,status")
    .eq("client_id", clientRow.id)
    .in("status", ["open", "reopened"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { client: clientRow, user: userRow, openRequest };
}

async function main() {
  console.log("== Input Security Test (Live) ==\n");

  // --- Seed login verification ---
  const signedIn: Array<{
    slug: string;
    email: string;
    client: SupabaseClient;
    clientId: string;
    userId: string;
    canViewInputs: boolean;
    canViewReports: boolean;
    openRequestId: string | null;
  }> = [];

  for (const seed of SEED_USERS) {
    const ctx = await getSeedContext(seed.slug);
    if (!ctx) {
      record("LOGIN", "ERROR", `${seed.slug}: client not found in DB — run npm run seed:test-customers`, "High");
      continue;
    }

    const client = await signInAs(seed.email, seed.password);
    if (!client) continue;

    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) {
      record("LOGIN", "ERROR", `${seed.email}: no user after login`);
      continue;
    }

    const portal = client.schema("portal");
    const { data: cu } = await portal
      .from("client_users")
      .select("can_view_reports,can_view_inputs,client_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!cu) {
      record("LOGIN", "ERROR", `${seed.email}: no client_users row`);
      continue;
    }

    if (cu.can_view_reports !== seed.canViewReports || cu.can_view_inputs !== seed.canViewInputs) {
      record(
        "LOGIN",
        "ERROR",
        `${seed.email}: permission mismatch DB=${JSON.stringify(cu)} expected reports=${seed.canViewReports} inputs=${seed.canViewInputs}`,
      );
    } else {
      record("LOGIN", "PASS", `${seed.email}: login OK, permissions match`);
    }

    signedIn.push({
      slug: seed.slug,
      email: seed.email,
      client,
      clientId: ctx.client.id,
      userId: user.id,
      canViewInputs: cu.can_view_inputs,
      canViewReports: cu.can_view_reports,
      openRequestId: ctx.openRequest?.id ?? null,
    });
  }

  if (signedIn.length < 2) {
    console.error("\nNeed at least 2 seed users logged in. Aborting security cases.");
    process.exit(1);
  }

  const voll = signedIn.find((s) => s.slug === "test-vollzugriff");
  const reportsOnly = signedIn.find((s) => s.slug === "test-nur-reports");
  const inputsOnly = signedIn.find((s) => s.slug === "test-nur-inputs");

  // --- S3: reports-only cannot see/insert inputs ---
  if (reportsOnly) {
    const portal = reportsOnly.client.schema("portal");
    const { data: reqs, error: reqErr } = await portal.from("input_requests").select("id");
    if (reqErr) {
      record("S3", "PASS", `test-nur-reports: SELECT input_requests denied (${reqErr.message})`);
    } else if ((reqs ?? []).length === 0) {
      record("S3", "PASS", "test-nur-reports: SELECT input_requests returns 0 rows");
    } else {
      record("S3", "LEAK", `test-nur-reports: SELECT input_requests returned ${reqs!.length} row(s)!`, "High");
    }

    const anyOpenId = voll?.openRequestId ?? signedIn.find((s) => s.openRequestId)?.openRequestId;
    if (anyOpenId) {
      const { data: inserted, error: insErr } = await portal
        .from("input_submissions")
        .insert({
          request_id: anyOpenId,
          client_id: reportsOnly.clientId,
          submitted_by: reportsOnly.userId,
          data: { security_test: "S3" },
        })
        .select("id");
      if (!insErr && inserted && inserted.length > 0) {
        record("S3", "LEAK", "test-nur-reports: INSERT input_submissions accepted!", "High");
        cleanupSubmissionIds.push(inserted[0].id);
      } else {
        record("S3", "PASS", `test-nur-reports: INSERT input_submissions blocked (${insErr?.message ?? "0 rows"})`);
      }
    }
  }

  // --- S1: own client_id + foreign request_id ---
  if (voll && signedIn.length >= 2) {
    const foreign = signedIn.find((s) => s.clientId !== voll.clientId && s.openRequestId);
    if (foreign?.openRequestId) {
      const portal = voll.client.schema("portal");
      const { data: inserted, error: insErr } = await portal
        .from("input_submissions")
        .insert({
          request_id: foreign.openRequestId,
          client_id: voll.clientId,
          submitted_by: voll.userId,
          data: { security_test: "S1" },
        })
        .select("id");
      if (!insErr && inserted && inserted.length > 0) {
        record("S1", "LEAK", "Own client_id + foreign request_id INSERT accepted!", "High");
        cleanupSubmissionIds.push(inserted[0].id);
      } else {
        record("S1", "PASS", `Own client_id + foreign request_id blocked (${insErr?.message ?? "0 rows"})`);
      }
    } else {
      record("S1", "INFO", "Skipped — no foreign open request available");
    }
  }

  // --- S2: duplicate submit after status=submitted ---
  if (voll) {
    let testRequestId = voll.openRequestId;
    if (!testRequestId) {
      const { data: created } = await adminPortal
        .from("input_requests")
        .insert({
          client_id: voll.clientId,
          title: "Security-Test S2 (temp)",
          kind: "freetext",
          status: "open",
        })
        .select("id")
        .single();
      testRequestId = created?.id ?? null;
    }

    if (testRequestId) {
      await adminPortal.from("input_requests").update({ status: "submitted" }).eq("id", testRequestId);

      const portal = voll.client.schema("portal");
      const { data: inserted, error: insErr } = await portal
        .from("input_submissions")
        .insert({
          request_id: testRequestId,
          client_id: voll.clientId,
          submitted_by: voll.userId,
          data: { security_test: "S2" },
        })
        .select("id");

      if (!insErr && inserted && inserted.length > 0) {
        record("S2", "LEAK", "INSERT allowed when request status=submitted (duplicate submit via API)", "Medium");
        cleanupSubmissionIds.push(inserted[0].id);
      } else {
        record("S2", "PASS", `INSERT blocked when request status=submitted (${insErr?.message ?? "0 rows"})`);
      }

      await adminPortal.from("input_requests").update({ status: "reopened" }).eq("id", testRequestId);
    }
  }

  // --- S6: submitted_by != auth.uid() ---
  if (voll && inputsOnly) {
    const portal = voll.client.schema("portal");
    const reqId = voll.openRequestId ?? inputsOnly.openRequestId;
    if (reqId) {
      const fakeSubmittedBy = "00000000-0000-0000-0000-000000000001";
      const { data: inserted, error: insErr } = await portal
        .from("input_submissions")
        .insert({
          request_id: reqId,
          client_id: voll.clientId,
          submitted_by: fakeSubmittedBy,
          data: { security_test: "S6" },
        })
        .select("id");
      if (!insErr && inserted && inserted.length > 0) {
        record("S6", "LEAK", "INSERT with foreign submitted_by accepted!", "Critical");
        cleanupSubmissionIds.push(inserted[0].id);
      } else {
        record("S6", "PASS", `INSERT with wrong submitted_by blocked (${insErr?.message ?? "0 rows"})`);
      }
    }
  }

  // --- S4: storage without can_view_inputs ---
  if (reportsOnly) {
    const path = `${reportsOnly.clientId}/security-test-s4.txt`;
    const blob = new Blob(["S4 storage test"], { type: "text/plain" });
    const { error: upErr } = await reportsOnly.client.storage.from("submissions").upload(path, blob, { upsert: true });
    if (upErr) {
      record("S4", "PASS", `test-nur-reports: storage INSERT blocked (${upErr.message})`);
    } else {
      record("S4", "LEAK", "test-nur-reports: storage INSERT succeeded without can_view_inputs!", "Medium");
      cleanupStoragePaths.push(path);

      const { data: listed, error: listErr } = await reportsOnly.client.storage.from("submissions").list(reportsOnly.clientId);
      if (!listErr && (listed ?? []).some((f) => f.name.includes("security-test-s4"))) {
        record("S4", "LEAK", "test-nur-reports: storage SELECT/list also works", "Medium");
      }
    }
  }

  // --- S5: foreign client storage prefix ---
  if (voll && inputsOnly && voll.clientId !== inputsOnly.clientId) {
    const foreignPath = `${inputsOnly.clientId}/security-test-s5-probe.txt`;
    const { data: downloaded, error: dlErr } = await voll.client.storage.from("submissions").download(foreignPath);
    if (!dlErr && downloaded) {
      record("S5", "LEAK", "User A could download file under foreign client prefix!", "Critical");
    } else {
      const { data: listed } = await voll.client.storage.from("submissions").list(inputsOnly.clientId);
      if ((listed ?? []).length > 0) {
        record("S5", "LEAK", `User A can list foreign storage prefix (${listed!.length} objects)`, "High");
      } else {
        record("S5", "PASS", "Foreign storage prefix not accessible");
      }
    }

    const ownPrefixPath = `${inputsOnly.clientId}/attacker-upload-s5.txt`;
    const { error: upErr } = await voll.client.storage
      .from("submissions")
      .upload(ownPrefixPath, new Blob(["x"]), { upsert: true });
    if (upErr) {
      record("S5", "PASS", `Upload to foreign prefix blocked (${upErr.message})`);
    } else {
      record("S5", "LEAK", "User A uploaded to foreign client storage prefix!", "Critical");
      cleanupStoragePaths.push(ownPrefixPath);
    }
  }

  // --- Cleanup ---
  console.log("\n== Cleanup ==");
  for (const id of cleanupSubmissionIds) {
    await adminPortal.from("input_submissions").delete().eq("id", id);
  }
  for (const path of cleanupStoragePaths) {
    await admin.storage.from("submissions").remove([path]);
  }
  console.log(`Removed ${cleanupSubmissionIds.length} test submissions, ${cleanupStoragePaths.length} storage objects.`);

  // --- Summary ---
  const leaks = results.filter((r) => r.result === "LEAK");
  const fails = results.filter((r) => r.result === "FAIL");
  const errors = results.filter((r) => r.result === "ERROR");
  const passes = results.filter((r) => r.result === "PASS");

  console.log("\n== Summary ==");
  console.log(`PASS: ${passes.length} | LEAK: ${leaks.length} | FAIL: ${fails.length} | ERROR: ${errors.length}`);

  // JSON for report generation
  console.log("\n__RESULTS_JSON__");
  console.log(JSON.stringify(results, null, 2));

  if (leaks.length > 0) process.exit(1);
  if (errors.filter((e) => e.id === "LOGIN").length >= 3) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
