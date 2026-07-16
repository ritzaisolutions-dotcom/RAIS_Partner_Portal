import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { PortalPageHeader } from "@/components/portal-page-header";
import {
  ADMIN_STATUS_TRANSITIONS,
  CUSTOMER_REQUEST_STATUS_CHIP,
  CUSTOMER_REQUEST_STATUS_LABEL,
} from "@/lib/customer-request-status";
import { fileNameFromStoragePath } from "@/lib/customer-request-upload";
import { requireAdminUser } from "@/lib/portal-queries";
import { CustomerRequestAuthorRole, CustomerRequestStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type RequestEvent = {
  id: string;
  kind: string;
  author_role: CustomerRequestAuthorRole;
  body_md: string | null;
  new_status: string | null;
  attachment_paths: string[] | null;
  created_at: string;
};

export default async function AdminRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = await searchParams;
  const { supabase } = await requireAdminUser();
  const portal = supabase.schema("portal");

  const { data: request } = await portal
    .from("customer_requests")
    .select("*, clients(name,primary_contact_email)")
    .eq("id", id)
    .maybeSingle();

  if (!request) notFound();

  const status = request.status as CustomerRequestStatus;
  const allowedStatuses = ADMIN_STATUS_TRANSITIONS[status];

  const { data: events } = await portal
    .from("customer_request_events")
    .select("id,kind,author_role,body_md,new_status,attachment_paths,created_at")
    .eq("request_id", id)
    .order("created_at", { ascending: true });

  const requestAttachments = await Promise.all(
    (request.attachment_paths ?? []).map(async (path: string) => {
      const { data } = await supabase.storage.from("customer-requests").createSignedUrl(path, 3600);
      return { path, url: data?.signedUrl ?? null, name: fileNameFromStoragePath(path) };
    }),
  );

  const clientRecord = request.clients as { name: string; primary_contact_email: string | null } | null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/requests" className="text-sm text-[var(--color-stone)] hover:text-[var(--color-charcoal)]">
          ← Kundenanfragen
        </Link>
        <span className={`chip ${CUSTOMER_REQUEST_STATUS_CHIP[status] ?? "chip-neutral"}`}>
          {CUSTOMER_REQUEST_STATUS_LABEL[status] ?? request.status}
        </span>
      </div>

      <PortalPageHeader title={request.subject} />

      <div className="portal-card p-6 md:p-8 space-y-3">
        <p className="text-sm text-[var(--color-stone)]">
          {clientRecord?.name ?? "Unbekannter Kunde"} · {request.category} · {request.area} · {request.project_name}
        </p>
        {clientRecord?.primary_contact_email ? (
          <p className="text-xs text-[var(--color-stone)]">{clientRecord.primary_contact_email}</p>
        ) : null}
        <p className="text-xs text-[var(--color-stone)]">Eingereicht am {formatDate(request.created_at)}</p>
        <div className="whitespace-pre-wrap text-[var(--color-charcoal)]">{request.description_md}</div>
        {requestAttachments.filter((entry) => entry.url).length ? (
          <ul className="space-y-1">
            {requestAttachments
              .filter((entry) => entry.url)
              .map((attachment) => (
                <li key={attachment.path}>
                  <a href={attachment.url!} className="text-[var(--color-orange)] text-sm underline" target="_blank" rel="noreferrer">
                    {attachment.name}
                  </a>
                </li>
              ))}
          </ul>
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

      <form action={`/admin/requests/${id}/update`} method="post" className="portal-card p-6 md:p-8 space-y-4">
        <h3 className="font-serif text-lg font-semibold text-[var(--color-charcoal)]">Antwort / Status</h3>

        {allowedStatuses.length ? (
          <div>
            <label htmlFor="new_status" className="login-label block mb-2">
              Status ändern
            </label>
            <select id="new_status" name="new_status" defaultValue="">
              <option value="">— unverändert —</option>
              {allowedStatuses.map((nextStatus) => (
                <option key={nextStatus} value={nextStatus}>
                  {CUSTOMER_REQUEST_STATUS_LABEL[nextStatus]}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-stone)]">Für diesen Status sind keine weiteren Übergänge möglich.</p>
        )}

        <div>
          <label htmlFor="body_md" className="login-label block mb-2">
            Nachricht an Kunden (Markdown)
          </label>
          <textarea id="body_md" name="body_md" rows={8} placeholder="Ihre Antwort an den Kunden..." />
        </div>

        {resolvedSearch.error ? <p className="text-sm text-red-600">{resolvedSearch.error}</p> : null}
        {resolvedSearch.success ? <p className="chip chip-success">{resolvedSearch.success}</p> : null}

        <button type="submit" className="btn btn-primary">
          Speichern
        </button>
      </form>
    </section>
  );
}

async function EventBlock({
  event,
  supabase,
}: {
  event: RequestEvent;
  supabase: Awaited<ReturnType<typeof requireAdminUser>>["supabase"];
}) {
  const attachments = await Promise.all(
    (event.attachment_paths ?? []).map(async (path) => {
      const { data } = await supabase.storage.from("customer-requests").createSignedUrl(path, 3600);
      return { path, url: data?.signedUrl ?? null, name: fileNameFromStoragePath(path) };
    }),
  );

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
        <p className="text-sm font-medium text-[var(--color-charcoal)]">{isAdmin ? "RAIS" : "Kunde"}</p>
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
      {attachments.filter((entry) => entry.url).length ? (
        <ul className="mt-2 space-y-1">
          {attachments
            .filter((entry) => entry.url)
            .map((attachment) => (
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
