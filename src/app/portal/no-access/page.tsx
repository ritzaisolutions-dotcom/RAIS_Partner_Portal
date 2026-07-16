import { PortalEmptyState } from "@/components/portal-empty-state";

export default function PortalNoAccessPage() {
  return (
    <section className="space-y-4">
      <PortalEmptyState
        icon="🔒"
        title="Kein Zugriff auf Portalbereiche"
        description="Ihr Konto ist aktiv, hat aber keine Freigabe für Reports, Aufgaben, Anfragen oder Dokumente. Bitte wenden Sie sich an Ihr RAIS-Ansprechpartner-Team."
      />
    </section>
  );
}
