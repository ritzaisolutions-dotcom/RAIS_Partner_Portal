import { cookies } from "next/headers";
import { TempPasswordReveal } from "./temp-password-reveal";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const cookieStore = await cookies();
  // Nur lesen: Cookies duerfen in Server Components nicht mutiert werden.
  // Das aktive Loeschen uebernimmt TempPasswordReveal (Client-Komponente) nach der Anzeige.
  const tempPassword = cookieStore.get("temp_password_flash")?.value ?? null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl">Neuen Kunden anlegen</h2>
      <form action="/admin/clients/new/create" method="post" encType="multipart/form-data" className="card card-content space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs text-grey-600 mb-1">
            Kundenname
          </label>
          <input id="name" name="name" required />
        </div>
        <div>
          <label htmlFor="slug" className="block text-xs text-grey-600 mb-1">
            Slug
          </label>
          <input id="slug" name="slug" required />
        </div>
        <div>
          <label htmlFor="primary_contact_email" className="block text-xs text-grey-600 mb-1">
            Kontakt-E-Mail (Client-User)
          </label>
          <input id="primary_contact_email" name="primary_contact_email" type="email" required />
        </div>
        <div>
          <label htmlFor="display_name" className="block text-xs text-grey-600 mb-1">
            Anzeigename User
          </label>
          <input id="display_name" name="display_name" required />
        </div>
        <div>
          <label htmlFor="logo" className="block text-xs text-grey-600 mb-1">
            Kundenlogo
          </label>
          <input id="logo" name="logo" type="file" accept="image/*" />
        </div>
        {resolvedSearch?.error ? <p className="chip chip-error">{resolvedSearch.error}</p> : null}
        {resolvedSearch?.success ? <p className="chip chip-success">{resolvedSearch.success}</p> : null}
        {tempPassword ? <TempPasswordReveal password={tempPassword} /> : null}
        <button type="submit" className="btn btn-primary">
          Kunde anlegen
        </button>
      </form>
    </section>
  );
}
