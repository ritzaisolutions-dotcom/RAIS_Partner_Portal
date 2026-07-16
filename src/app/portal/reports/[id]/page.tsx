import Markdown from "react-markdown";
import { redirect } from "next/navigation";
import remarkGfm from "remark-gfm";
import { PortalPageHeader } from "@/components/portal-page-header";
import { createClient } from "@/lib/supabase/server";
import { getReportForClient, requirePortalUser, resolvePortalHome } from "@/lib/portal-queries";
import { formatDate } from "@/lib/utils";

async function resolveSignedImageUrls(markdown: string) {
  const matches = [...markdown.matchAll(/\(storage:([^)]+)\)/g)];
  if (matches.length === 0) {
    return markdown;
  }

  const supabase = await createClient();
  let resolvedMarkdown = markdown;
  const signedPathCache = new Map<string, string>();

  for (const match of matches) {
    const fullMatch = match[0];
    const path = match[1];
    if (signedPathCache.has(path)) {
      resolvedMarkdown = resolvedMarkdown.replace(fullMatch, `(${signedPathCache.get(path)})`);
      continue;
    }

    const { data, error } = await supabase.storage.from("report-images").createSignedUrl(path, 60 * 60);
    if (error || !data?.signedUrl) {
      continue;
    }

    signedPathCache.set(path, data.signedUrl);
    resolvedMarkdown = resolvedMarkdown.replace(fullMatch, `(${data.signedUrl})`);
  }

  return resolvedMarkdown;
}

export default async function PortalReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { clientId, canViewReports, canViewInputs, canSubmitRequests, canViewDocuments } = await requirePortalUser();
  if (!canViewReports) {
    redirect(resolvePortalHome({ canViewReports, canViewInputs, canSubmitRequests, canViewDocuments }));
  }

  const report = await getReportForClient(id, clientId!);
  const renderedMarkdown = await resolveSignedImageUrls(report.body_md);

  return (
    <article className="space-y-6">
      <PortalPageHeader
        title={report.title}
        description={`Veröffentlicht: ${formatDate(report.published_at ?? report.created_at)}`}
      />
      <div className="portal-card p-6 md:p-8 prose prose-stone max-w-none">
        <Markdown remarkPlugins={[remarkGfm]}>{renderedMarkdown}</Markdown>
      </div>
    </article>
  );
}
