import Link from "next/link";
import { PublicLegalLayout } from "@/components/public-legal-layout";

export default function DatenschutzPage() {
  return (
    <PublicLegalLayout title="Datenschutzerklärung">
      <p className="text-sm text-[var(--color-stone)]">
        Diese Anwendung verarbeitet personenbezogene Daten ausschließlich zur Bereitstellung des RAIS Client Portals und
        zur Kommunikation über Status-Reports und Input-Anfragen.
      </p>
      <section className="space-y-2">
        <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Subprozessoren</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-[var(--color-charcoal)]">
          <li>Supabase (Region Frankfurt, Datenbank, Authentifizierung, Storage)</li>
          <li>Vercel (Region fra1, Hosting)</li>
          <li>SMTP-E-Mail-Dienst (über n8n Email Send Node angebunden)</li>
          <li>Hostinger/n8n (Vilnius, Orchestrierung von Webhooks)</li>
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Cookies</h2>
        <p className="text-sm text-[var(--color-charcoal)]">
          Es werden ausschließlich technisch notwendige Session-Cookies verwendet. Ein Consent-Banner ist daher nicht
          erforderlich.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Löschkonzept</h2>
        <p className="text-sm text-[var(--color-charcoal)]">
          Bei Löschung eines Partners werden die Daten über Cascade-Relations in der Datenbank entfernt und zugehörige Dateien
          per Storage-Cleanup-Prozess gelöscht.
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Rechtsgrundlagen</h2>
        <p className="text-sm text-[var(--color-charcoal)]">
          Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Erfüllung des Vertrags zwischen RAIS und dem
          jeweiligen Partners bzw. Vorbereitung eines solchen Vertrags) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
          an einer funktionierenden, sicheren Kommunikations- und Projektplattform).
        </p>
      </section>
      <section className="space-y-2">
        <h2 className="font-serif text-xl font-semibold text-[var(--color-charcoal)]">Betroffenenrechte</h2>
        <p className="text-sm text-[var(--color-charcoal)]">
          Betroffene Personen haben nach Maßgabe der DSGVO das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung
          (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21)
          gegen die Verarbeitung ihrer personenbezogenen Daten. Anfragen richten Sie bitte an die im{" "}
          <Link href="/impressum" className="text-[var(--color-orange)] underline-offset-2 hover:underline">
            Impressum
          </Link>{" "}
          genannte verantwortliche Stelle.
        </p>
      </section>
    </PublicLegalLayout>
  );
}
