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
    <div className="min-h-screen bg-[var(--color-linen)]">
      <PortalHeader title={title} subtitle={subtitle} logoUrl={logoUrl} variant={variant} />

      <div className="flex pt-[68px]">
        <PortalSidebar links={links} variant={variant} />

        <main className="portal-content flex-1 min-w-0 md:ml-64 px-4 md:px-10 py-8 md:py-10 max-w-[1400px]">
          <nav className="flex md:hidden gap-2 mb-6 overflow-x-auto pb-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="chip chip-neutral whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </nav>
          {children}
          <footer className="mt-12 text-center text-xs text-[var(--color-stone)] space-y-1 border-t border-[color-mix(in_srgb,var(--color-stone)_20%,transparent)] pt-6">
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
        </main>
      </div>
    </div>
  );
}
