import Link from "next/link";
import { PortalPageHeader } from "@/components/portal-page-header";
import { requireAdminUser } from "@/lib/portal-queries";
import { OPEN_CUSTOMER_REQUEST_STATUSES } from "@/lib/customer-request-status";
import { CustomerRequestStatus } from "@/lib/types";

const WAITING_STATUSES = new Set(["open", "reopened"]);
const DONE_STATUSES = new Set(["submitted", "accepted"]);

export default async function AdminHomePage() {
  const { supabase } = await requireAdminUser();
  const portal = supabase.schema("portal");

  const [{ data: clients }, { data: requests }, { data: customerRequests }] = await Promise.all([
    portal.from("clients").select("id,name,slug,primary_contact_email").order("created_at"),
    portal.from("input_requests").select("id,client_id,status,due_date").neq("status", "draft"),
    portal.from("customer_requests").select("id,status"),
  ]);

  const openCustomerRequests = (customerRequests ?? []).filter((entry) =>
    OPEN_CUSTOMER_REQUEST_STATUSES.has(entry.status as CustomerRequestStatus),
  ).length;

  const byClient = new Map<string, { total: number; waiting: number; done: number }>();
  for (const request of requests ?? []) {
    const entry = byClient.get(request.client_id) ?? { total: 0, waiting: 0, done: 0 };
    entry.total += 1;
    if (WAITING_STATUSES.has(request.status)) entry.waiting += 1;
    if (DONE_STATUSES.has(request.status)) entry.done += 1;
    byClient.set(request.client_id, entry);
  }

  const rows = (clients ?? []).map((client) => {
    const stats = byClient.get(client.id) ?? { total: 0, waiting: 0, done: 0 };
    const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : null;
    return { client, stats, pct };
  });

  const totalWaiting = rows.reduce((sum, row) => sum + row.stats.waiting, 0);
  const clientsWithWaiting = rows.filter((row) => row.stats.waiting > 0).length;
  const clientsWithRequests = rows.filter((row) => row.stats.total > 0);
  const avgCompletion =
    clientsWithRequests.length > 0
      ? Math.round(clientsWithRequests.reduce((sum, row) => sum + (row.pct ?? 0), 0) / clientsWithRequests.length)
      : null;

  return (
    <section className="space-y-6">
      <PortalPageHeader
        eyebrow="Dashboard"
        title="Übersicht"
        description="Partner, offene Input-Anfragen und Partneranfragen auf einen Blick."
        actions={
          <Link href="/admin/clients/new" className="btn btn-primary shrink-0">
            + Neuer Partner
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="portal-kpi-card-accent">
          <p className="portal-kpi-label">Offene Input-Anfragen</p>
          <p className="portal-kpi-value mt-2">{totalWaiting}</p>
          <p className="portal-kpi-subtext text-xs mt-2">warten auf Partner-Input</p>
        </div>
        <div className="portal-kpi-card-charcoal">
          <p className="portal-kpi-label">Offene Partneranfragen</p>
          <p className="portal-kpi-value mt-2">{openCustomerRequests}</p>
          <p className="portal-kpi-subtext text-xs mt-2">warten auf RAIS</p>
        </div>
        <div className="portal-kpi-card">
          <p className="portal-kpi-label">Partner mit offenen Punkten</p>
          <p className="portal-kpi-value mt-2">{clientsWithWaiting}</p>
          <p className="text-xs text-[var(--color-stone)] mt-2">von {rows.length} Partnern gesamt</p>
        </div>
        <div className="portal-kpi-card">
          <p className="portal-kpi-label">Ø Erledigungsquote</p>
          <p className="portal-kpi-value mt-2">{avgCompletion !== null ? `${avgCompletion}%` : "–"}</p>
          <p className="text-xs text-[var(--color-stone)] mt-2">über alle versendeten Input-Anfragen</p>
        </div>
      </div>

      <div className="portal-card">
        <div className="px-6 py-4 border-b border-[color-mix(in_srgb,var(--color-stone)_30%,transparent)]">
          <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Partnerprojekte</h2>
        </div>
        {rows.length ? (
          <div className="admin-list-scroll">
            {rows.map(({ client, stats, pct }) => (
              <Link
                key={client.id}
                href={`/admin/clients/${client.id}?tab=inputs`}
                className="table-row admin-list-row admin-list-row-customer portal-card-hover"
              >
                <div className="h-9 w-9 rounded-lg bg-[var(--color-linen-soft)] text-[var(--color-charcoal)] border border-[color-mix(in_srgb,var(--color-stone)_30%,transparent)] flex items-center justify-center font-semibold shrink-0">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="admin-list-inline-meta">
                  <span className="font-medium text-[var(--color-charcoal)] truncate">{client.name}</span>
                  <span className="text-xs text-[var(--color-stone)] truncate">
                    {client.slug}
                    {client.primary_contact_email ? ` · ${client.primary_contact_email}` : ""}
                  </span>
                </div>

                <div className="shrink-0">
                  <div className="hidden md:flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[var(--color-linen-soft)] overflow-hidden min-w-[4rem]">
                      <div className="h-full rounded-full bg-success" style={{ width: `${pct ?? 0}%` }} />
                    </div>
                    <p className="text-xs text-[var(--color-stone)] shrink-0 whitespace-nowrap">
                      {pct !== null ? `${pct}%` : "keine Anfragen"}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--color-stone)] whitespace-nowrap md:hidden">–</p>
                </div>

                {stats.waiting > 0 ? (
                  <span className="chip chip-warning shrink-0">{stats.waiting} wartend</span>
                ) : (
                  <span className="chip chip-success shrink-0">Alles erledigt</span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-[var(--color-stone)]">Noch keine Partner angelegt.</div>
        )}
      </div>
    </section>
  );
}
