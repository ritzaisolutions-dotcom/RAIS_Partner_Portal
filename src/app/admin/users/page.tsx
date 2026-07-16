import { PortalPageHeader } from "@/components/portal-page-header";
import { requireAdminUser } from "@/lib/portal-queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";

type ClientUserRow = {
  user_id: string;
  client_id: string;
  display_name: string;
  can_view_reports: boolean;
  can_view_inputs: boolean;
  can_submit_requests: boolean;
  can_view_documents: boolean;
  created_at: string;
  clients: { name: string; slug: string } | null;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const { supabase } = await requireAdminUser();
  const portal = supabase.schema("portal");

  const { data: clientUsers } = await portal
    .from("client_users")
    .select("user_id,client_id,display_name,can_view_reports,can_view_inputs,can_submit_requests,can_view_documents,created_at,clients(name,slug)")
    .order("created_at", { ascending: false });

  const admin = createAdminClient();
  const emailByUserId = new Map<string, string>();
  let page = 1;
  const perPage = 200;
  for (let i = 0; i < 25; i++) {
    const { data: userPage, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error || !userPage) break;
    for (const u of userPage.users) {
      if (u.email) emailByUserId.set(u.id, u.email);
    }
    if (userPage.users.length < perPage) break;
    page += 1;
  }

  const rows = ((clientUsers ?? []) as unknown as ClientUserRow[]).map((row) => ({
    ...row,
    email: emailByUserId.get(row.user_id) ?? "–",
  }));

  return (
    <section className="space-y-6">
      <PortalPageHeader
        title="Benutzer & Rechte"
        description="Alle Kundenzugänge über alle Kunden hinweg – E-Mail zu Kunde zuordnen und Sichtbarkeit steuern."
      />

      {resolvedSearch.success ? <p className="chip chip-success">{resolvedSearch.success}</p> : null}

      <div className="portal-card">
        {rows.length ? (
          <div className="admin-list-scroll">
            {rows.map((row) => (
              <div key={row.user_id} className="table-row admin-list-row admin-list-row-user">
                <div className="h-8 w-8 rounded-lg bg-[var(--color-linen-soft)] text-[var(--color-charcoal)] border border-[color-mix(in_srgb,var(--color-stone)_30%,transparent)] flex items-center justify-center text-xs font-semibold shrink-0">
                  {row.display_name.charAt(0).toUpperCase()}
                </div>

                <div className="admin-list-inline-meta">
                  <span className="font-medium text-[var(--color-charcoal)] truncate">{row.display_name}</span>
                  <span className="text-xs text-[var(--color-stone)] truncate">
                    {row.email} · {row.clients?.name ?? "Unbekannter Kunde"}
                  </span>
                </div>

                <div className="text-xs text-[var(--color-stone)] shrink-0 whitespace-nowrap">
                  <span className="hidden lg:inline">Seit {formatDate(row.created_at)}</span>
                  <span className="lg:hidden">–</span>
                </div>

                <form
                  action={`/admin/clients/${row.client_id}/users/${row.user_id}/update`}
                  method="post"
                  className="flex items-center gap-2 shrink-0 whitespace-nowrap"
                >
                  <input type="hidden" name="redirect_to" value="/admin/users" />
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-stone)] shrink-0">
                    <input type="checkbox" name="can_view_reports" defaultChecked={row.can_view_reports} className="!w-4 shrink-0" />
                    Reports
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-stone)] shrink-0">
                    <input type="checkbox" name="can_view_inputs" defaultChecked={row.can_view_inputs} className="!w-4 shrink-0" />
                    Input-Anfragen
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-stone)] shrink-0">
                    <input type="checkbox" name="can_submit_requests" defaultChecked={row.can_submit_requests ?? true} className="!w-4 shrink-0" />
                    Anfragen senden
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-stone)] shrink-0">
                    <input type="checkbox" name="can_view_documents" defaultChecked={row.can_view_documents ?? true} className="!w-4 shrink-0" />
                    Dokumente
                  </label>
                  <button type="submit" className="btn btn-secondary !text-xs !py-1.5 !px-3 shrink-0">
                    Speichern
                  </button>
                </form>

                <form action={`/admin/clients/${row.client_id}/users/${row.user_id}/remove`} method="post" className="shrink-0 whitespace-nowrap">
                  <input type="hidden" name="redirect_to" value="/admin/users" />
                  <button type="submit" className="btn btn-ghost !text-xs !py-1.5 !px-3">
                    Entfernen
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-[var(--color-stone)]">Noch keine Kundenzugänge angelegt.</div>
        )}
      </div>
    </section>
  );
}
