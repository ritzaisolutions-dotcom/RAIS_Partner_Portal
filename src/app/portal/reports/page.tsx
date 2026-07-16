import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalPageHeader } from "@/components/portal-page-header";
import { requirePortalUser, resolvePortalHome } from "@/lib/portal-queries";
import { formatDate } from "@/lib/utils";

export default async function PortalReportsPage() {
  const { supabase, clientId, canViewReports, canViewInputs, canSubmitRequests, canViewDocuments } =
    await requirePortalUser();
  if (!canViewReports) {
    redirect(resolvePortalHome({ canViewReports, canViewInputs, canSubmitRequests, canViewDocuments }));
  }

  const { data: reports } = await supabase
    .schema("portal")
    .from("status_reports")
    .select("id,title,published_at,created_at")
    .eq("client_id", clientId!)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  return (
    <section className="space-y-6">
      <PortalPageHeader
        title="Status-Reports"
        description="Veröffentlichte Berichte und Updates von RAIS zu Ihrem Projekt."
      />
      <div className="portal-card">
        {reports?.length ? (
          <div>
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/portal/reports/${report.id}`}
                className="table-row flex items-center justify-between gap-3 px-6 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-charcoal)] truncate">{report.title}</p>
                  <p className="text-xs text-[var(--color-stone)]">Veröffentlicht: {formatDate(report.published_at ?? report.created_at)}</p>
                </div>
                <span className="chip chip-success shrink-0">Veröffentlicht</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-[var(--color-stone)]">Noch keine Reports verfügbar.</div>
        )}
      </div>
    </section>
  );
}
