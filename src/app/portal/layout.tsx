import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requirePortalUser } from "@/lib/portal-queries";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const {
    supabase,
    user,
    clientId,
    isAdmin,
    canViewReports,
    canViewInputs,
    canSubmitRequests,
    canViewDocuments,
  } = await requirePortalUser();
  if (isAdmin) redirect("/admin");
  if (!clientId) redirect("/login");

  const [{ data: client }, { data: clientUser }] = await Promise.all([
    supabase.schema("portal").from("clients").select("name,logo_path").eq("id", clientId).single(),
    supabase.schema("portal").from("client_users").select("display_name").eq("user_id", user.id).maybeSingle(),
  ]);

  const links = [
    { href: "/portal", label: "Übersicht" },
    ...(canViewReports ? [{ href: "/portal/reports", label: "Reports" }] : []),
    ...(canViewInputs ? [{ href: "/portal/inputs", label: "Aufgaben" }] : []),
    ...(canSubmitRequests ? [{ href: "/portal/requests", label: "Anfragen" }] : []),
    ...(canViewDocuments ? [{ href: "/portal/documents", label: "Dokumente" }] : []),
  ];

  return (
    <AppShell
      variant="portal"
      title={client?.name ?? "Partner Portal"}
      subtitle="Ihre Reports, Aufgaben, Anfragen und Dokumente"
      links={links}
      logoUrl={client?.logo_path ?? null}
      identityName={clientUser?.display_name ?? user.email ?? client?.name ?? "Partner"}
      identityRole="Partner Portal"
    >
      {children}
    </AppShell>
  );
}
