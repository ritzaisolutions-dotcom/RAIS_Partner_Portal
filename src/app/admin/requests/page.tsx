import Link from "next/link";
import { PortalPageHeader } from "@/components/portal-page-header";
import { PortalEmptyState } from "@/components/portal-empty-state";
import { StitchFilterField, StitchFilterPanel } from "@/components/stitch-filter-panel";
import {
  CUSTOMER_REQUEST_STATUS_CHIP,
  CUSTOMER_REQUEST_STATUS_LABEL,
  OPEN_CUSTOMER_REQUEST_STATUSES,
} from "@/lib/customer-request-status";
import { requireAdminUser } from "@/lib/portal-queries";
import { CustomerRequestStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; client?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const { supabase } = await requireAdminUser();
  const portal = supabase.schema("portal");

  const [{ data: clients }, { data: requests }] = await Promise.all([
    portal.from("clients").select("id,name").order("name"),
    portal.from("customer_requests").select("id,client_id,subject,category,area,project_name,status,created_at").order("created_at", {
      ascending: false,
    }),
  ]);

  const clientNameById = new Map((clients ?? []).map((client) => [client.id, client.name]));

  const filtered = (requests ?? []).filter((request) => {
    if (resolvedSearch.status && request.status !== resolvedSearch.status) return false;
    if (resolvedSearch.client && request.client_id !== resolvedSearch.client) return false;
    return true;
  });

  return (
    <section className="space-y-6">
      <PortalPageHeader
        eyebrow="Partneranfragen"
        title="Partneranfragen"
        description="Alle eingehenden Anfragen von Partnern – filtern, bearbeiten und Status verwalten."
      />

      <StitchFilterPanel>
        <form method="get" className="flex flex-wrap gap-4 items-end w-full">
          <StitchFilterField label="Status" htmlFor="status">
            <select id="status" name="status" defaultValue={resolvedSearch.status ?? ""}>
              <option value="">Alle</option>
              {(Object.keys(CUSTOMER_REQUEST_STATUS_LABEL) as CustomerRequestStatus[]).map((status) => (
                <option key={status} value={status}>
                  {CUSTOMER_REQUEST_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </StitchFilterField>
          <StitchFilterField label="Partner" htmlFor="client">
            <select id="client" name="client" defaultValue={resolvedSearch.client ?? ""}>
              <option value="">Alle</option>
              {(clients ?? []).map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </StitchFilterField>
          <button type="submit" className="btn btn-charcoal btn-uppercase shrink-0">
            Filtern
          </button>
        </form>
      </StitchFilterPanel>

      {filtered.length ? (
        <div className="portal-card">
          <div>
            {filtered.map((request) => {
              const status = request.status as CustomerRequestStatus;
              const isOpen = OPEN_CUSTOMER_REQUEST_STATUSES.has(status);
              return (
                <Link
                  key={request.id}
                  href={`/admin/requests/${request.id}`}
                  className="table-row flex items-center gap-4 px-6 py-4 last:border-b-0 portal-card-hover"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--color-charcoal)] truncate">{request.subject}</p>
                    <p className="text-xs text-[var(--color-stone)] truncate">
                      {clientNameById.get(request.client_id) ?? request.client_id} · {request.category} · {request.project_name}
                    </p>
                    <p className="text-xs text-[var(--color-stone)]">{formatDate(request.created_at)}</p>
                  </div>
                  <span className={`chip ${isOpen ? "chip-warning" : CUSTOMER_REQUEST_STATUS_CHIP[status]} shrink-0`}>
                    {CUSTOMER_REQUEST_STATUS_LABEL[status] ?? request.status}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <PortalEmptyState icon="∅" title="Keine Anfragen gefunden" description="Passen Sie die Filter an oder warten Sie auf neue Partneranfragen." />
      )}
    </section>
  );
}
