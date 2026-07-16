import Link from "next/link";
import { CLIENT_DOCUMENT_CATEGORIES } from "@/lib/client-document-status";
import { ACCEPT_SUBMISSION_FILES } from "@/lib/upload-validation";

export default async function AdminNewClientDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = await searchParams;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/admin/clients/${id}?tab=documents`} className="text-sm text-grey-500 hover:text-grey-900">
          ← Zurück
        </Link>
        <h2 className="text-xl">Dokument hochladen</h2>
      </div>

      <form
        action={`/admin/clients/${id}/documents/new/create`}
        method="post"
        encType="multipart/form-data"
        className="portal-card portal-card-body space-y-4"
      >
        <div>
          <label htmlFor="title" className="block text-xs text-grey-600 mb-1">
            Titel
          </label>
          <input id="title" name="title" required maxLength={200} />
        </div>

        <div>
          <label htmlFor="category" className="block text-xs text-grey-600 mb-1">
            Kategorie
          </label>
          <select id="category" name="category" required defaultValue="Rechnung">
            {CLIENT_DOCUMENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description_md" className="block text-xs text-grey-600 mb-1">
            Beschreibung (optional)
          </label>
          <textarea id="description_md" name="description_md" rows={4} />
        </div>

        <div>
          <label htmlFor="document_file" className="block text-xs text-grey-600 mb-1">
            Datei
          </label>
          <input id="document_file" name="document_file" type="file" accept={ACCEPT_SUBMISSION_FILES} required />
        </div>

        {resolvedSearch.error ? <p className="chip chip-error">{resolvedSearch.error}</p> : null}

        <p className="text-xs text-grey-500">
          Das Dokument wird als Entwurf gespeichert. Erst nach Freigabe sieht der Partner es im Portal.
        </p>

        <button type="submit" className="btn btn-primary">
          Hochladen
        </button>
      </form>
    </section>
  );
}
