import { notFound } from "next/navigation";
import { requireAdminUser } from "@/lib/portal-queries";

export default async function EditClientPage({
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
  const { data: client } = await portal.from("clients").select("id,name,slug,primary_contact_email,logo_path").eq("id", id).maybeSingle();

  if (!client) notFound();

  return (
    <section className="space-y-4">
      <h2 className="text-xl">Partner bearbeiten</h2>
      <form action={`/admin/clients/${id}/edit/update`} method="post" encType="multipart/form-data" className="portal-card portal-card-body space-y-4">
        {client.logo_path ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={client.logo_path} alt="Aktuelles Logo" className="h-12 w-12 rounded object-contain bg-grey-100" />
            <p className="text-xs text-grey-500">Aktuelles Logo</p>
          </div>
        ) : null}
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" required defaultValue={client.name} />
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="slug">
            Slug
          </label>
          <input id="slug" name="slug" required defaultValue={client.slug} />
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="primary_contact_email">
            Kontakt-E-Mail
          </label>
          <input id="primary_contact_email" name="primary_contact_email" type="email" defaultValue={client.primary_contact_email ?? ""} />
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="logo">
            Neues Logo hochladen (optional, ersetzt das bestehende)
          </label>
          <input id="logo" name="logo" type="file" accept="image/*" />
        </div>
        {resolvedSearch.error ? <p className="chip chip-error">{resolvedSearch.error}</p> : null}
        {resolvedSearch.success ? <p className="chip chip-success">{resolvedSearch.success}</p> : null}
        <button type="submit" className="btn btn-primary">
          Änderungen speichern
        </button>
      </form>
    </section>
  );
}
