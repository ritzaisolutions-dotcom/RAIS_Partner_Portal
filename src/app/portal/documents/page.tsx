import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalPageHeader } from "@/components/portal-page-header";
import {
  CLIENT_DOCUMENT_CATEGORIES,
  CLIENT_DOCUMENT_CATEGORY_CHIP,
  ClientDocumentCategory,
} from "@/lib/client-document-status";
import { requirePortalUser, resolvePortalHome } from "@/lib/portal-queries";
import { formatDate } from "@/lib/utils";

export default async function PortalDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; error?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const {
    supabase,
    clientId,
    canViewReports,
    canViewInputs,
    canSubmitRequests,
    canViewDocuments,
  } = await requirePortalUser();

  if (!canViewDocuments) {
    redirect(
      resolvePortalHome({ canViewReports, canViewInputs, canSubmitRequests, canViewDocuments }),
    );
  }

  const portal = supabase.schema("portal");
  let query = portal
    .from("client_documents")
    .select("id,title,category,file_name,description_md,published_at,created_at")
    .eq("client_id", clientId!)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const categoryFilter =
    resolvedSearch.category && CLIENT_DOCUMENT_CATEGORIES.includes(resolvedSearch.category as ClientDocumentCategory)
      ? (resolvedSearch.category as ClientDocumentCategory)
      : null;

  if (categoryFilter) {
    query = query.eq("category", categoryFilter);
  }

  const { data: documents } = await query;

  return (
    <section className="space-y-6">
      <PortalPageHeader
        title="Dokumente"
        description="Freigegebene Verträge, Rechnungen und Unterlagen zum Download."
        actions={
          <form method="get" className="flex flex-wrap items-center gap-2">
            <label htmlFor="category" className="text-xs text-[var(--color-stone)]">
              Kategorie
            </label>
            <select id="category" name="category" defaultValue={categoryFilter ?? ""} className="text-sm !w-auto">
              <option value="">Alle</option>
              {CLIENT_DOCUMENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary !text-xs !py-1.5 !px-3">
              Filtern
            </button>
          </form>
        }
      />

      {resolvedSearch.error ? <p className="text-sm text-red-600">{resolvedSearch.error}</p> : null}

      {documents?.length ? (
        <div className="portal-card">
          <div>
            {documents.map((document) => {
              const category = document.category as ClientDocumentCategory;
              return (
                <div
                  key={document.id}
                  className="table-row flex items-center gap-4 px-6 py-4 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--color-charcoal)] truncate">{document.title}</p>
                    <p className="text-xs text-[var(--color-stone)] truncate">
                      {document.file_name}
                      {document.published_at ? ` · ${formatDate(document.published_at)}` : ""}
                    </p>
                    {document.description_md ? (
                      <p className="text-xs text-[var(--color-stone)] mt-1 line-clamp-2 whitespace-pre-wrap">
                        {document.description_md}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`chip ${CLIENT_DOCUMENT_CATEGORY_CHIP[category] ?? "chip-neutral"} shrink-0`}
                  >
                    {document.category}
                  </span>
                  <Link
                    href={`/portal/documents/${document.id}/download`}
                    className="btn btn-primary !text-xs !py-1.5 !px-3 shrink-0"
                  >
                    Download
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="portal-empty">
          <p>
            {categoryFilter
              ? `Keine freigegebenen Dokumente in der Kategorie „${categoryFilter}".`
              : "Noch keine freigegebenen Dokumente vorhanden."}
          </p>
        </div>
      )}
    </section>
  );
}
