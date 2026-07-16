import { PublicLegalLayout } from "@/components/public-legal-layout";

export default function ImpressumPage() {
  return (
    <PublicLegalLayout title="Impressum & Kontakt">
      <section className="portal-card p-6 space-y-3">
        <p className="font-semibold text-[var(--color-charcoal)]">Kontaktieren Sie uns</p>
        <p className="text-sm text-[var(--color-stone)]">
          Passwort vergessen oder Fragen zum Portal? Schreiben Sie uns — wir helfen Ihnen gerne weiter.
        </p>
        <ul className="text-sm space-y-2">
          <li>
            E-Mail:{" "}
            <a href="mailto:kevin@ritz-ai.solutions" className="font-medium text-[var(--color-orange)] underline-offset-2 hover:underline">
              kevin@ritz-ai.solutions
            </a>
          </li>
          <li>
            Telefon:{" "}
            <a href="tel:+4915129755134" className="font-medium text-[var(--color-orange)] underline-offset-2 hover:underline">
              +49 151 2975 5134
            </a>
          </li>
          <li>
            Web:{" "}
            <a
              href="https://ritz-ai.solutions"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-orange)] underline-offset-2 hover:underline"
            >
              ritz-ai.solutions
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-1 text-sm text-[var(--color-charcoal)]">
        <p className="font-semibold">Anbieter</p>
        <p>Kevin Ritz</p>
        <p>IT-Beratung und Entwicklung digitaler Lösungen für Unternehmen</p>
        <p>Von-Cohausen-Straße 9</p>
        <p>56076 Koblenz</p>
        <p>Handelnd unter: Ritz AI Solutions (RAIS)</p>
      </section>

      <section className="space-y-1 text-sm text-[var(--color-charcoal)]">
        <p className="font-semibold">Umsatzsteuer</p>
        <p>Kleinunternehmer gemäß § 19 UStG – es wird keine Umsatzsteuer berechnet und ausgewiesen.</p>
      </section>

      <section className="space-y-1 text-sm text-[var(--color-charcoal)]">
        <p className="font-semibold">Verantwortlich für den Inhalt</p>
        <p>Kevin Ritz (Anschrift wie oben)</p>
      </section>

      <section className="space-y-1 text-sm text-[var(--color-charcoal)]">
        <p className="font-semibold">Verbraucherstreitbeilegung / Universalschlichtungsstelle</p>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </section>
    </PublicLegalLayout>
  );
}
