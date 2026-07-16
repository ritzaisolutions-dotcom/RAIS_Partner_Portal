import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { redirect } from "next/navigation";
import { PortalPageHeader } from "@/components/portal-page-header";
import {
  CUSTOMER_REQUEST_STATUS_CHIP,
  CUSTOMER_REQUEST_STATUS_LABEL,
} from "@/lib/customer-request-status";
import { fileNameFromStoragePath } from "@/lib/customer-request-upload";
import { getCustomerRequestForClient, requirePortalUser, resolvePortalHome } from "@/lib/portal-queries";
import { CustomerRequestAuthorRole, CustomerRequestStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ACCEPT_SUBMISSION_FILES } from "@/lib/upload-validation";

type RequestEvent = {
  id: string;
  kind: string;
  author_role: CustomerRequestAuthorRole;
  body_md: string | null;
  new_status: string | null;
  attachment_paths: string[] | null;
  created_at: string;
};

async function signedAttachmentUrls(
  supabase: Awaited<ReturnType<typeof requirePortalUser>>["supabase"],
  paths: string[],
) {
  const urls = await Promise.all(
    paths.map(async (path) => {
      const { data } = await supabase.storage.from("customer-requests").createSignedUrl(path, 3600);
      return { path, url: data?.signedUrl ?? null, name: fileNameFromStoragePath(path) };
    }),
  );
  return urls.filter((entry) => entry.url);
}

export default async function PortalRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = await searchParams;
  const { supabase, clientId, canViewReports, canViewInputs, canSubmitRequests, canViewDocuments } =
    await requirePortalUser();
  if (!canSubmitRequests) {
    redirect(resolvePortalHome({ canViewReports, canViewInputs, canSubmitRequests, canViewDocuments }));
  }

  const request = await getCustomerRequestForClient(id, clientId!);
  const status = request.status as CustomerRequestStatus;
  const portal = supabase.schema("portal");

  const { data: events } = await portal
    .from("customer_request_events")
    .select("id,kind,author_role,body_md,new_status,attachment_paths,created_at")
    .eq("request_id", id)
    .order("created_at", { ascending: true });

  const requestAttachments = await signedAttachmentUrls(supabase, request.attachment_paths ?? []);
  const canReply = status === "revision";

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/requests" className="text-sm text-[var(--color-stone)] hover:text-[var(--color-charcoal)]">
          ← Anfragen
        </Link>
        <span className={`chip ${CUSTOMER_REQUEST_STATUS_CHIP[status] ?? "chip-neutral"}`}>
          {CUSTOMER_REQUEST_STATUS_LABEL[status] ?? request.status}
        </span>
      </div>

      <PortalPageHeader
        title={request.subject}
        description={`${request.category} · ${request.area} · ${request.project_name}`}
      />

      <div className="portal-card p-6 md:p-8 space-y-3 -mt-2">
        <p className="text-xs text-[var(--color-stone)]">Eingereicht am {formatDate(request.created_at)}</p>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-[var(--color-charcoal)]">{request.description_md}</div>

        {requestAttachments.length ? (
          <div className="pt-2">
            <p className="text-sm font-medium text-[var(--color-charcoal)] mb-2">Anhänge</p>
            <ul className="space-y-1">
              {requestAttachments.map((attachment) => (
                <li key={attachment.path}>
                  <a href={attachment.url!} className="text-[var(--color-orange)] text-sm underline" target="_blank" rel="noreferrer">
                    {attachment.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {(events as RequestEvent[] | null)?.length ? (
        <div className="portal-card p-6 md:p-8 space-y-4">
          <h3 className="font-serif text-lg font-semibold text-[var(--color-charcoal)]">Verlauf</h3>
          {(events as RequestEvent[]).map((event) => (
            <EventBlock key={event.id} event={event} supabase={supabase} />
          ))}
        </div>
      ) : null}

      {resolvedSearch.success ? (
        <div className="portal-success-banner" role="status">
          <span className="portal-success-banner-icon" aria-hidden="true">
            ✓
          </span>
          <p className="portal-success-banner-text">{resolvedSearch.success}</p>
        </div>
      ) : null}

      {canReply ? (
        <form
          action={`/portal/requests/${id}/reply`}
          method="post"
          encType="multipart/form-data"
          className="portal-card p-6 md:p-8 space-y-4"
        >
          <h3 className="font-serif text-lg font-semibold text-[var(--color-charcoal)]">Ergänzung senden</h3>
          <p className="text-sm text-[var(--color-stone)]">RAIS hat Rückfragen. Bitte ergänzen Sie Ihre Anfrage.</p>
          <div>
            <label htmlFor="body_md" className="login-label block mb-2">
              Ihre Ergänzung
            </label>
            <textarea id="body_md" name="body_md" rows={6} required />
          </div>
          <div>
            <label htmlFor="attachments" className="login-label block mb-2">
              Weitere Anhänge (optional)
            </label>
            <input id="attachments" name="attachments" type="file" accept={ACCEPT_SUBMISSION_FILES} multiple />
          </div>
          {resolvedSearch.error ? <p className="text-sm text-red-600">{resolvedSearch.error}</p> : null}
          <button type="submit" className="btn btn-primary">
            Ergänzung übermitteln
          </button>
        </form>
      ) : null}
    </section>
  );
}

async function EventBlock({
  event,
  supabase,
}: {
  event: RequestEvent;
  supabase: Awaited<ReturnType<typeof requirePortalUser>>["supabase"];
}) {
  const attachments = await signedAttachmentUrls(supabase, event.attachment_paths ?? []);
  const isAdmin = event.author_role === "admin";
  const statusLabel =
    event.new_status && event.new_status in CUSTOMER_REQUEST_STATUS_LABEL
      ? CUSTOMER_REQUEST_STATUS_LABEL[event.new_status as CustomerRequestStatus]
      : event.new_status;

  return (
    <article
      className={`rounded-lg border p-4 ${
        isAdmin
          ? "border-[color-mix(in_srgb,var(--color-orange)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-linen-soft)_80%,white)]"
          : "border-[color-mix(in_srgb,var(--color-stone)_30%,transparent)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-[var(--color-charcoal)]">{isAdmin ? "RAIS" : "Sie"}</p>
        <p className="text-xs text-[var(--color-stone)]">{formatDate(event.created_at)}</p>
      </div>
      {event.kind === "status_change" && statusLabel ? (
        <p className="text-sm text-[var(--color-stone)] mb-2">Status geändert: {statusLabel}</p>
      ) : null}
      {event.body_md ? (
        <div className="prose prose-sm max-w-none">
          <Markdown remarkPlugins={[remarkGfm]}>{event.body_md}</Markdown>
        </div>
      ) : null}
      {attachments.length ? (
        <ul className="mt-2 space-y-1">
          {attachments.map((attachment) => (
            <li key={attachment.path}>
              <a href={attachment.url!} className="text-[var(--color-orange)] text-sm underline" target="_blank" rel="noreferrer">
                {attachment.name}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
