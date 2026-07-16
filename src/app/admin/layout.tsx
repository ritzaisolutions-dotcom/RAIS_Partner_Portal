import { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { requireAdminUser } from "@/lib/portal-queries";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminUser();
  return (
    <AppShell
      variant="admin"
      title="RAIS Admin"
      subtitle="Partner, Reports und Input-Anfragen verwalten"
      links={[
        { href: "/admin", label: "Partner" },
        { href: "/admin/requests", label: "Partneranfragen" },
        { href: "/admin/documents", label: "Vorlagen" },
        { href: "/admin/clients/new", label: "Neuer Partner" },
        { href: "/admin/users", label: "Partner-Zugänge" },
      ]}
    >
      {children}
    </AppShell>
  );
}
