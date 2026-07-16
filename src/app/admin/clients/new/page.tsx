import { cookies } from "next/headers";
import { TempPasswordReveal } from "./temp-password-reveal";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const cookieStore = await cookies();
  const tempPassword = cookieStore.get("temp_password_flash")?.value ?? null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl">Neuen Partner anlegen</h2>
        <p className="text-sm text-[var(--color-stone)] mt-1">
          Legt den Partner (Organisation) und den ersten Partner-Portal-Zugang in einem Schritt an.
        </p>
      </div>
      <form action="/admin/clients/new/create" method="post" encType="multipart/form-data" className="card card-content space-y-4">
        <div>
          <label htmlFor="name" className="block text-xs text-grey-600 mb-1">
            Partnername
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
            Kontakt-E-Mail (erster Partner-Zugang)
          </label>
          <input id="primary_contact_email" name="primary_contact_email" type="email" required />
        </div>
        <div>
          <label htmlFor="display_name" className="block text-xs text-grey-600 mb-1">
            Anzeigename
          </label>
          <input id="display_name" name="display_name" required />
        </div>
        <div>
          <label htmlFor="logo" className="block text-xs text-grey-600 mb-1">
            Partnerlogo
          </label>
          <input id="logo" name="logo" type="file" accept="image/*" />
        </div>
        {resolvedSearch?.error ? <p className="chip chip-error">{resolvedSearch.error}</p> : null}
        {resolvedSearch?.success ? <p className="chip chip-success">{resolvedSearch.success}</p> : null}
        {tempPassword ? <TempPasswordReveal password={tempPassword} /> : null}
        <button type="submit" className="btn btn-primary">
          Partner anlegen
        </button>
      </form>
    </section>
  );
}
