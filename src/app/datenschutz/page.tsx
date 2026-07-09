export default function DatenschutzPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-5">
      <h1 className="text-4xl">Datenschutzerklärung</h1>
      <p>
        Diese Anwendung verarbeitet personenbezogene Daten ausschließlich zur Bereitstellung des RAIS Client Portals und
        zur Kommunikation über Status-Reports und Input-Anfragen.
      </p>
      <section>
        <h2 className="text-2xl mb-2">Subprozessoren</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Supabase (Region Frankfurt, Datenbank, Authentifizierung, Storage)</li>
          <li>Vercel (Region fra1, Hosting)</li>
          <li>SMTP-E-Mail-Dienst (über n8n Email Send Node angebunden)</li>
          <li>Hostinger/n8n (Vilnius, Orchestrierung von Webhooks)</li>
        </ul>
      </section>
      <section>
        <h2 className="text-2xl mb-2">Cookies</h2>
        <p>
          Es werden ausschließlich technisch notwendige Session-Cookies verwendet. Ein Consent-Banner ist daher nicht
          erforderlich.
        </p>
      </section>
      <section>
        <h2 className="text-2xl mb-2">Löschkonzept</h2>
        <p>
          Bei Löschung eines Kunden werden die Daten über Cascade-Relations in der Datenbank entfernt und zugehörige Dateien
          per Storage-Cleanup-Prozess gelöscht.
        </p>
      </section>
      <section>
        <h2 className="text-2xl mb-2">Rechtsgrundlagen</h2>
        <p>
          Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Erfüllung des Vertrags zwischen RAIS und dem
          jeweiligen Kunden bzw. Vorbereitung eines solchen Vertrags) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
          an einer funktionierenden, sicheren Kommunikations- und Projektplattform).
        </p>
      </section>
      <section>
        <h2 className="text-2xl mb-2">Betroffenenrechte</h2>
        <p>
          Betroffene Personen haben nach Maßgabe der DSGVO das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung
          (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) sowie Widerspruch (Art. 21)
          gegen die Verarbeitung ihrer personenbezogenen Daten. Anfragen richten Sie bitte an die im{" "}
          <a href="/impressum" className="underline">Impressum</a> genannte verantwortliche Stelle.
        </p>
      </section>
    </main>
  );
}
