import Link from "next/link";
import { PortalPageHeader } from "@/components/portal-page-header";
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

  return (
    <section className="space-y-6">
      <PortalPageHeader
        title="Vorlagen"
        description="Dokumentvorlagen verwalten und für Kunden generieren."
        actions={
          <Link href="/admin/documents/new" className="btn btn-primary shrink-0">
            + Vorlage hochladen
          </Link>
        }
      />

      {[...grouped.entries()].length ? (
        [...grouped.entries()].map(([category, items]) => (
          <div key={category} className="portal-card">
            <div className="px-6 py-4 border-b border-[color-mix(in_srgb,var(--color-stone)_30%,transparent)]">
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
        <div className="portal-empty">
          Noch keine Vorlagen vorhanden.{" "}
          <Link href="/admin/documents/new" className="text-[var(--color-orange)] font-medium underline-offset-2 hover:underline">
            Erste Vorlage hochladen
          </Link>
        </div>
      )}
    </section>
  );
}
