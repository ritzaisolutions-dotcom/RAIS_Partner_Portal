import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalPageHeader } from "@/components/portal-page-header";
import {
  CUSTOMER_REQUEST_STATUS_CHIP,
  CUSTOMER_REQUEST_STATUS_LABEL,
  OPEN_CUSTOMER_REQUEST_STATUSES,
} from "@/lib/customer-request-status";
import { requirePortalUser } from "@/lib/portal-queries";
import { CustomerRequestStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const OPEN_INPUT_STATUSES = ["open", "reopened"] as const;

export default async function PortalPage() {
  const {
    supabase,
    clientId,
    canViewReports,
    canViewInputs,
    canSubmitRequests,
    canViewDocuments,
  } = await requirePortalUser();

  const hasAccess =
    canViewReports || canViewInputs || canSubmitRequests || canViewDocuments;
  if (!hasAccess) {
    redirect("/portal/no-access");
  }

  const portal = supabase.schema("portal");

  const openInputsListPromise = canViewInputs
    ? portal
        .from("input_requests")
        .select("id,title,status,due_date")
        .eq("client_id", clientId!)
        .in("status", OPEN_INPUT_STATUSES)
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(5)
    : Promise.resolve({ data: [] as { id: string; title: string; status: string; due_date: string | null }[] });

  const openInputsCountPromise = canViewInputs
    ? portal
        .from("input_requests")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientId!)
        .in("status", OPEN_INPUT_STATUSES)
    : Promise.resolve({ count: 0 });

  const openRequestsPromise = canSubmitRequests
    ? portal
        .from("customer_requests")
        .select("id,subject,status,created_at")
        .eq("client_id", clientId!)
        .order("created_at", { ascending: false })
    : Promise.resolve({ data: [] as { id: string; subject: string; status: string; created_at: string }[] });

  const recentDocumentsPromise = canViewDocuments
    ? portal
        .from("client_documents")
        .select("id,title,category,published_at")
        .eq("client_id", clientId!)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(5)
    : Promise.resolve({ data: [] as { id: string; title: string; category: string; published_at: string | null }[] });

  const latestReportPromise = canViewReports
    ? portal
        .from("status_reports")
        .select("id,title,published_at,created_at")
        .eq("client_id", clientId!)
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle()
    : Promise.resolve({ data: null });

  const [{ data: openInputs }, { count: openInputsCount }, { data: allRequests }, { data: recentDocuments }, { data: latestReport }] =
    await Promise.all([openInputsListPromise, openInputsCountPromise, openRequestsPromise, recentDocumentsPromise, latestReportPromise]);

  const openRequests = (allRequests ?? []).filter((request) =>
    OPEN_CUSTOMER_REQUEST_STATUSES.has(request.status as CustomerRequestStatus),
  );

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newDocumentsCount = (recentDocuments ?? []).filter(
    (document) => document.published_at && new Date(document.published_at) >= sevenDaysAgo,
  ).length;

  return (
    <section className="space-y-8">
      <PortalPageHeader
        title="Übersicht"
        description="Was brauche ich heute? Hier sehen Sie offene Aufgaben, Anfragen und neue Dokumente auf einen Blick."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {canViewInputs ? (
          <Link href="/portal/inputs" className="portal-kpi-card portal-card-hover block">
            <p className="portal-kpi-label">Offene Aufgaben</p>
            <p className="portal-kpi-value mt-2">{openInputsCount ?? 0}</p>
            <p className="text-xs text-[var(--color-stone)] mt-2">Zu erledigen oder nachreichen</p>
          </Link>
        ) : null}
        {canSubmitRequests ? (
          <Link href="/portal/requests" className="portal-kpi-card portal-card-hover block">
            <p className="portal-kpi-label">Offene Anfragen</p>
            <p className="portal-kpi-value mt-2">{openRequests.length}</p>
            <p className="text-xs text-[var(--color-stone)] mt-2">In Bearbeitung bei RAIS</p>
          </Link>
        ) : null}
        {canViewDocuments ? (
          <Link href="/portal/documents" className="portal-kpi-card portal-card-hover block">
            <p className="portal-kpi-label">Neue Dokumente</p>
            <p className="portal-kpi-value mt-2">{newDocumentsCount}</p>
            <p className="text-xs text-[var(--color-stone)] mt-2">In den letzten 7 Tagen</p>
          </Link>
        ) : null}
        {canViewReports && latestReport ? (
          <Link href={`/portal/reports/${latestReport.id}`} className="portal-kpi-card portal-card-hover block">
            <p className="portal-kpi-label">Neuester Report</p>
            <p className="font-serif text-lg font-semibold text-[var(--color-charcoal)] mt-2 line-clamp-2">
              {latestReport.title}
            </p>
            <p className="text-xs text-[var(--color-stone)] mt-2">
              {formatDate(latestReport.published_at ?? latestReport.created_at)}
            </p>
          </Link>
        ) : canViewReports ? (
          <div className="portal-kpi-card">
            <p className="portal-kpi-label">Neuester Report</p>
            <p className="text-sm text-[var(--color-stone)] mt-2">Noch kein Report verfügbar</p>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canViewInputs ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Offene Aufgaben</h2>
              <Link href="/portal/inputs" className="text-sm text-[var(--color-orange)] font-medium">
                Alle anzeigen
              </Link>
            </div>
            {openInputs?.length ? (
              <div className="portal-card">
                {openInputs.map((input) => (
                  <Link
                    key={input.id}
                    href={`/portal/inputs/${input.id}`}
                    className="table-row flex items-center justify-between gap-3 px-5 py-4 last:border-b-0 portal-card-hover"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--color-charcoal)] truncate">{input.title}</p>
                      <p className="text-xs text-[var(--color-stone)]">
                        {input.due_date ? `Fällig: ${formatDate(input.due_date)}` : "Kein Fälligkeitsdatum"}
                      </p>
                    </div>
                    <span className="chip chip-warning shrink-0">Offen</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="portal-empty">
                <p>Keine offenen Aufgaben — alles erledigt.</p>
              </div>
            )}
          </section>
        ) : null}

        {canSubmitRequests ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Anfragen</h2>
              <Link href="/portal/requests" className="text-sm text-[var(--color-orange)] font-medium">
                Alle anzeigen
              </Link>
            </div>
            {openRequests.length ? (
              <div className="portal-card">
                {openRequests.slice(0, 5).map((request) => {
                  const status = request.status as CustomerRequestStatus;
                  return (
                    <Link
                      key={request.id}
                      href={`/portal/requests/${request.id}`}
                      className="table-row flex items-center justify-between gap-3 px-5 py-4 last:border-b-0 portal-card-hover"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--color-charcoal)] truncate">{request.subject}</p>
                        <p className="text-xs text-[var(--color-stone)]">{formatDate(request.created_at)}</p>
                      </div>
                      <span className={`chip ${CUSTOMER_REQUEST_STATUS_CHIP[status] ?? "chip-neutral"} shrink-0`}>
                        {CUSTOMER_REQUEST_STATUS_LABEL[status] ?? request.status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="portal-empty">
                <p>Keine offenen Anfragen.</p>
                <Link href="/portal/requests/new" className="text-[var(--color-orange)] font-medium mt-2 inline-block">
                  Neue Anfrage senden
                </Link>
              </div>
            )}
          </section>
        ) : null}

        {canViewDocuments ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Dokumente</h2>
              <Link href="/portal/documents" className="text-sm text-[var(--color-orange)] font-medium">
                Alle anzeigen
              </Link>
            </div>
            {recentDocuments?.length ? (
              <div className="portal-card">
                {recentDocuments.map((document) => (
                  <Link
                    key={document.id}
                    href={`/portal/documents/${document.id}/download`}
                    className="table-row flex items-center justify-between gap-3 px-5 py-4 last:border-b-0 portal-card-hover"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--color-charcoal)] truncate">{document.title}</p>
                      <p className="text-xs text-[var(--color-stone)]">
                        {document.published_at ? formatDate(document.published_at) : ""}
                      </p>
                    </div>
                    <span className="chip chip-neutral shrink-0">{document.category}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="portal-empty">
                <p>Noch keine freigegebenen Dokumente.</p>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </section>
  );
}
