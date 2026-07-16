import { cookies } from "next/headers";
import { PortalPageHeader } from "@/components/portal-page-header";
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
    <section className="space-y-8">
      <PortalPageHeader
        eyebrow="Partnerverwaltung"
        title="Neuen Partner anlegen"
        description="Organisation, erster Portal-Zugang und optionales Logo in einem Schritt."
      />

      <form action="/admin/clients/new/create" method="post" encType="multipart/form-data" className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="portal-card portal-card-body space-y-5">
            <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Mandantendetails</h2>
            <div>
              <label htmlFor="name" className="login-label block mb-2">
                Partnername
              </label>
              <input id="name" name="name" required />
            </div>
            <div>
              <label htmlFor="slug" className="login-label block mb-2">
                Slug
              </label>
              <input id="slug" name="slug" required />
            </div>
          </div>

          <div className="portal-card portal-card-body space-y-5">
            <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Kontakt & erster Zugang</h2>
            <div>
              <label htmlFor="primary_contact_email" className="login-label block mb-2">
                Kontakt-E-Mail
              </label>
              <input id="primary_contact_email" name="primary_contact_email" type="email" required />
            </div>
            <div>
              <label htmlFor="display_name" className="login-label block mb-2">
                Anzeigename
              </label>
              <input id="display_name" name="display_name" required />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="portal-card portal-card-body space-y-4">
            <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Branding</h2>
            <div className="portal-inset border-dashed text-center py-8">
              <label htmlFor="logo" className="login-label block mb-3">
                Partnerlogo
              </label>
              <input id="logo" name="logo" type="file" accept="image/*" className="!w-auto mx-auto" />
              <p className="text-xs text-[var(--color-stone)] mt-3">PNG oder JPG, optional</p>
            </div>
          </div>

          <div className="portal-card portal-card-body space-y-4">
            <h2 className="font-serif text-lg font-semibold text-[var(--color-charcoal)]">Zusammenfassung</h2>
            <p className="text-sm text-[var(--color-stone)]">
              Es wird ein Partner-Organisationseintrag und ein Partner-Portal-Login mit Einmalpasswort angelegt.
            </p>
            <span className="chip chip-neutral">Entwurf</span>
            {resolvedSearch?.error ? <p className="chip chip-error">{resolvedSearch.error}</p> : null}
            {resolvedSearch?.success ? <p className="chip chip-success">{resolvedSearch.success}</p> : null}
            {tempPassword ? <TempPasswordReveal password={tempPassword} /> : null}
            <button type="submit" className="btn btn-primary btn-uppercase w-full">
              Partner anlegen
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
