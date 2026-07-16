import { redirect } from "next/navigation";
import { PortalPageHeader } from "@/components/portal-page-header";
import { getInputRequestForClient, parseFormSchema, requirePortalUser, resolvePortalHome } from "@/lib/portal-queries";
import { ACCEPT_SUBMISSION_FILES } from "@/lib/upload-validation";

export default async function PortalInputDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = await searchParams;
  const { clientId, canViewReports, canViewInputs, canSubmitRequests, canViewDocuments } = await requirePortalUser();
  if (!canViewInputs) {
    redirect(resolvePortalHome({ canViewReports, canViewInputs, canSubmitRequests, canViewDocuments }));
  }

  const request = await getInputRequestForClient(id, clientId!);
  const fields = parseFormSchema(request.form_schema);
  const canSubmit = ["open", "reopened"].includes(request.status);

  return (
    <section className="space-y-6">
      <PortalPageHeader
        title={request.title}
        description={request.description_md ?? undefined}
      />

      {request.due_date ? (
        <p className="text-sm text-[var(--color-stone)] -mt-4">Fällig am: {request.due_date}</p>
      ) : null}

      {canSubmit ? (
        <form
          action={`/portal/inputs/${id}/submit`}
          method="post"
          encType="multipart/form-data"
          className="portal-card p-6 md:p-8 space-y-4"
        >
          {request.kind === "freetext" ? (
            <div>
              <label htmlFor="freetext" className="login-label block mb-2">
                Ihre Antwort
              </label>
              <textarea id="freetext" name="freetext" rows={8} required />
            </div>
          ) : (
            fields.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className="login-label block mb-2">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea id={field.key} name={field.key} required={field.required} rows={5} />
                ) : field.type === "select" ? (
                  <select id={field.key} name={field.key} required={field.required}>
                    <option value="">Bitte wählen</option>
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "file" ? (
                  <input id={field.key} name={field.key} type="file" accept={ACCEPT_SUBMISSION_FILES} required={field.required} />
                ) : (
                  <input id={field.key} name={field.key} type={field.type} required={field.required} />
                )}
              </div>
            ))
          )}

          <div>
            <label htmlFor="attachments" className="login-label block mb-2">
              Weitere Dateien (optional)
            </label>
            <input id="attachments" name="attachments" type="file" accept={ACCEPT_SUBMISSION_FILES} multiple />
          </div>

          {resolvedSearch.error ? <p className="text-sm text-red-600">{resolvedSearch.error}</p> : null}
          {resolvedSearch.success ? (
            <div className="portal-success-banner" role="status">
              <span className="portal-success-banner-icon" aria-hidden="true">
                ✓
              </span>
              <p className="portal-success-banner-text">{resolvedSearch.success}</p>
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary">
            Antwort einreichen
          </button>
        </form>
      ) : (
        <div className="portal-card p-6 md:p-8 space-y-3">
          {resolvedSearch.success ? (
            <div className="portal-success-banner" role="status">
              <span className="portal-success-banner-icon" aria-hidden="true">
                ✓
              </span>
              <p className="portal-success-banner-text">{resolvedSearch.success}</p>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-stone)]">Diese Anfrage ist derzeit nicht zur Einreichung geöffnet.</p>
          )}
        </div>
      )}
    </section>
  );
}
