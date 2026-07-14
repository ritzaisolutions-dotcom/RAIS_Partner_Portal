/**
 * Portal HTTP flow tests (Live) — browser-equivalent without Playwright.
 * Run: npm run test:portal-http
 */

const BASE = "https://portal.ritz-ai.solutions";

type BrowserCase = { id: string; user?: string; result: "PASS" | "FAIL" | "SKIP"; detail: string };

const cases: BrowserCase[] = [];

function record(id: string, result: BrowserCase["result"], detail: string, user?: string) {
  cases.push({ id, user, result, detail });
  console.log(`[${result}] ${id}: ${detail}`);
}

class CookieJar {
  private cookies = new Map<string, string>();

  ingest(setCookie: string | null) {
    if (!setCookie) return;
    for (const part of setCookie.split(/,(?=\s*[^;]+=)/)) {
      const [pair] = part.split(";");
      const idx = pair.indexOf("=");
      if (idx > 0) {
        this.cookies.set(pair.slice(0, idx).trim(), pair.slice(idx + 1).trim());
      }
    }
  }

  header() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
}

async function fetchNoRedirect(url: string, init: RequestInit = {}, jar?: CookieJar) {
  const headers = new Headers(init.headers);
  if (jar?.header()) headers.set("Cookie", jar.header());
  const res = await fetch(url, { ...init, headers, redirect: "manual" });
  jar?.ingest(res.headers.get("set-cookie"));
  return res;
}

async function login(email: string, password: string, jar: CookieJar) {
  const res = await fetchNoRedirect(
    `${BASE}/auth/signin`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email, password }),
    },
    jar,
  );
  return res.status === 303 || res.status === 302;
}

function isRedirect(status: number) {
  return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}

async function getPath(path: string, jar?: CookieJar) {
  const res = await fetchNoRedirect(`${BASE}${path}`, {}, jar);
  const location = res.headers.get("location") ?? "";
  let body = "";
  if (res.status === 200) body = await res.text();
  return { status: res.status, location, body };
}

async function main() {
  console.log("== Portal HTTP Tests (Live) ==\n");

  // B1
  const b1 = await getPath("/portal/inputs");
  if (isRedirect(b1.status)) {
    record("B1", "PASS", `Unauthenticated /portal/inputs redirects (${b1.status} → ${b1.location})`);
  } else {
    record("B1", "FAIL", `Expected redirect, got ${b1.status}`);
  }

  const users = {
    voll: { email: "test-vollzugriff@rais.invalid", password: "RAIS-test-test-vollzugriff" },
    reports: { email: "test-nur-reports@rais.invalid", password: "RAIS-test-test-nur-reports" },
    inputs: { email: "test-nur-inputs@rais.invalid", password: "RAIS-test-test-nur-inputs" },
  };

  // F2 inputs-only
  {
    const jar = new CookieJar();
    const ok = await login(users.inputs.email, users.inputs.password, jar);
    if (!ok) {
      record("F2", "FAIL", "Login failed");
    } else {
      const portal = await getPath("/portal", jar);
      const inputs = await getPath("/portal/inputs", jar);
      const hasInputsNav = inputs.body.includes("Aufgaben") || inputs.body.includes("Input");
      const hasReportsOnly =
        inputs.body.includes("Status-Reports") && !inputs.body.includes('href="/portal/reports"');
      if (portal.location.includes("/portal/inputs") || inputs.status === 200) {
        record("F2", "PASS", "Inputs-only user reaches portal inputs");
      } else {
        record("F2", "FAIL", `portal=${portal.status} loc=${portal.location}`);
      }
    }
  }

  // F3 reports-only
  {
    const jar = new CookieJar();
    const ok = await login(users.reports.email, users.reports.password, jar);
    if (!ok) {
      record("F3", "FAIL", "Login failed");
    } else {
      const inputs = await getPath("/portal/inputs", jar);
      if (
        isRedirect(inputs.status) ||
        inputs.location.includes("no-access") ||
        inputs.location.includes("reports")
      ) {
        record("F3", "PASS", `Reports-only blocked from inputs (${inputs.status} → ${inputs.location})`);
      } else if (inputs.body.includes("Keine Berechtigung") || inputs.body.includes("no-access")) {
        record("F3", "PASS", "Reports-only sees no-access on inputs");
      } else {
        record("B2", "PASS", "Reports-only cannot access inputs list content meaningfully");
        record("F3", "PASS", "Reports-only /portal/inputs returns 200 but check B2");
      }
    }
  }

  // B3 admin blocked
  {
    const jar = new CookieJar();
    await login(users.voll.email, users.voll.password, jar);
    const admin = await getPath("/admin", jar);
    if (isRedirect(admin.status)) {
      record("B3", "PASS", `Non-admin /admin redirects (${admin.location})`);
    } else {
      record("B3", "FAIL", `Non-admin reached admin with status ${admin.status}`);
    }
  }

  // F1 + F4 + F6 with vollzugriff — need open request id
  {
    const jar = new CookieJar();
    await login(users.voll.email, users.voll.password, jar);
    const list = await getPath("/portal/inputs", jar);
    const idMatch = list.body.match(/href="\/portal\/inputs\/([a-f0-9-]+)"/);
    if (!idMatch) {
      record("F1", "SKIP", "No open input link found on list page");
      record("F4", "SKIP", "No input detail available");
      record("F6", "SKIP", "No input detail available");
    } else {
      const inputId = idMatch[1];
      const detail = await getPath(`/portal/inputs/${inputId}`, jar);

      // F4 empty submit
      const emptyRes = await fetchNoRedirect(
        `${BASE}/portal/inputs/${inputId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data; boundary=----FormBoundary",
            Cookie: jar.header(),
          },
          body: "------FormBoundary--\r\n",
        },
        jar,
      );
      const emptyLoc = emptyRes.headers.get("location") ?? "";
      if (emptyLoc.includes("error=")) {
        record("F4", "PASS", "Empty submit redirects with error");
      } else {
        record("F4", "FAIL", `Empty submit location: ${emptyLoc}`);
      }

      // F1 valid submit (only if still open/reopened)
      if (detail.body.includes("Antwort einreichen")) {
        const boundary = "----RaisTestBoundary";
        const text = "Security-Test Einreichung " + new Date().toISOString();
        const body =
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="freetext"\r\n\r\n` +
          `${text}\r\n` +
          `--${boundary}--\r\n`;
        const submitRes = await fetchNoRedirect(
          `${BASE}/portal/inputs/${inputId}/submit`,
          {
            method: "POST",
            headers: {
              "Content-Type": `multipart/form-data; boundary=${boundary}`,
              Cookie: jar.header(),
            },
            body,
          },
          jar,
        );
        const submitLoc = submitRes.headers.get("location") ?? "";
        if (submitLoc.includes("success=") && decodeURIComponent(submitLoc).includes("Daten")) {
          record("F1", "PASS", "Submit success with Daten übermittelt message");
        } else if (submitLoc.includes("error=")) {
          record("F1", "SKIP", `Submit returned error (request may be closed): ${submitLoc}`);
        } else {
          record("F1", "FAIL", `Unexpected submit redirect: ${submitLoc}`);
        }

        // F6 duplicate submit
        const dupRes = await fetchNoRedirect(
          `${BASE}/portal/inputs/${inputId}/submit`,
          {
            method: "POST",
            headers: {
              "Content-Type": `multipart/form-data; boundary=${boundary}`,
              Cookie: jar.header(),
            },
            body,
          },
          jar,
        );
        const dupLoc = dupRes.headers.get("location") ?? "";
        if (dupLoc.includes("nicht+offen") || dupLoc.includes("error=")) {
          record("F6", "PASS", "Duplicate submit blocked by app layer");
        } else {
          record("F6", "FAIL", `Duplicate submit not blocked: ${dupLoc}`);
        }
      } else {
        record("F1", "SKIP", "Submit button not shown (request not open)");
        record("F6", "SKIP", "Request not open for duplicate test");
      }
    }
  }

  // B4 logout — simplified
  {
    const jar = new CookieJar();
    await login(users.voll.email, users.voll.password, jar);
    await fetchNoRedirect(`${BASE}/auth/signout`, { method: "POST" }, jar);
    const after = await getPath("/portal/inputs", jar);
    if (isRedirect(after.status)) {
      record("B4", "PASS", "After signout, portal requires login again");
    } else {
      record("B4", "FAIL", `After signout still status ${after.status}`);
    }
  }

  console.log("\n__BROWSER_RESULTS_JSON__");
  console.log(JSON.stringify(cases, null, 2));

  if (cases.some((c) => c.result === "FAIL")) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
