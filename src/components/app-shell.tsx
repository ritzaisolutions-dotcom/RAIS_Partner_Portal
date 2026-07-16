import Link from "next/link";
import { ReactNode } from "react";
import type { AppShellVariant } from "./app-shell-variant";
import { PortalHeader } from "./portal-header";
import { PortalSidebar } from "./portal-sidebar";

type AppShellProps = {
  title: string;
  subtitle?: string;
  links: Array<{ href: string; label: string }>;
  children: ReactNode;
  logoUrl?: string | null;
  variant: AppShellVariant;
};

export function AppShell({ title, subtitle, links, children, logoUrl, variant }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--color-linen)] flex flex-col">
      <PortalHeader title={title} subtitle={subtitle} logoUrl={logoUrl} variant={variant} />

      <div className="flex flex-1 min-h-0 pt-[68px]">
        <PortalSidebar links={links} variant={variant} />

        <div className="portal-content flex-1 min-w-0 p-4 md:p-8 md:pr-10">
          <nav className="flex md:hidden gap-2 mb-4 overflow-x-auto pb-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="chip chip-neutral whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </nav>
          {children}
          <footer className="mt-10 text-center text-xs text-[var(--color-stone)] space-y-1">
            <p>Powered by RAIS</p>
            <p className="space-x-3">
              <Link href="/datenschutz" className="underline-offset-2 hover:underline">
                Datenschutz
              </Link>
              <Link href="/impressum" className="underline-offset-2 hover:underline">
                Impressum
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
