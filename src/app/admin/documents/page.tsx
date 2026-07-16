import Link from "next/link";
import { PortalPageHeader } from "@/components/portal-page-header";
import { PortalEmptyLink, PortalEmptyState } from "@/components/portal-empty-state";
import { requireAdminUser } from "@/lib/portal-queries";

export default async function AdminDocumentsPage() {
  const { supabase } = await requireAdminUser();
  const portal = supabase.schema("portal");

  const { data: templates } = await portal
    .from("document_templates")
    .select("id,name,category,format,created_at")
    .order("category")
    .order("name");

  const grouped = new Map<string, NonNullable<typeof templates>>();
  for (const template of templates ?? []) {
    const list = grouped.get(template.category) ?? [];
    list.push(template);
    grouped.set(template.category, list);
  }

  const templateCount = templates?.length ?? 0;

  return (
    <section className="space-y-6">
      <PortalPageHeader
        eyebrow="Dokumentvorlagen"
        title="Vorlagen"
        description="Dokumentvorlagen verwalten und für Partner generieren."
        actions={
          <Link href="/admin/documents/new" className="btn btn-primary shrink-0">
            + Vorlage hochladen
          </Link>
        }
      />

      <div className="portal-inset flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="login-label mb-1">Hilfecenter</p>
          <p className="text-sm text-[var(--color-charcoal)]">
            HTML- und DOCX-Vorlagen mit Platzhaltern wie <code className="text-xs">{"{{KUNDE_FIRMA}}"}</code> hochladen und pro Partner generieren.
          </p>
        </div>
        <div className="text-right">
          <p className="login-label mb-1">Bibliothek</p>
          <p className="font-serif text-2xl font-semibold text-[var(--color-charcoal)]">{templateCount}</p>
          <p className="text-xs text-[var(--color-stone)]">Vorlagen gesamt</p>
        </div>
      </div>

      {[...grouped.entries()].length ? (
        [...grouped.entries()].map(([category, items]) => (
          <div key={category} className="portal-card">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h2 className="font-serif text-lg font-semibold text-[var(--color-charcoal)]">{category}</h2>
            </div>
            <div>
              {items.map((template) => (
                <Link
                  key={template.id}
                  href={`/admin/documents/${template.id}/generate`}
                  className="table-row flex items-center justify-between gap-4 px-6 py-4 last:border-b-0 portal-card-hover"
                >
                  <div>
                    <p className="font-medium text-[var(--color-charcoal)]">{template.name}</p>
                    <p className="text-xs text-[var(--color-stone)] uppercase">{template.format}</p>
                  </div>
                  <span className="chip chip-primary shrink-0">Generieren</span>
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <PortalEmptyState
          icon="📄"
          title="Noch keine Vorlagen vorhanden"
          description="Laden Sie Ihre erste HTML- oder DOCX-Vorlage hoch, um Dokumente für Partner zu generieren."
          action={<PortalEmptyLink href="/admin/documents/new" label="Erste Vorlage hochladen" />}
        />
      )}
    </section>
  );
}
