import Link from "next/link";
import { ReactNode } from "react";
import { PortalHeader } from "./portal-header";

type AppShellProps = {
  title: string;
  subtitle?: string;
  links: Array<{ href: string; label: string }>;
  children: ReactNode;
  logoUrl?: string | null;
};

export function AppShell({ title, subtitle, links, children, logoUrl }: AppShellProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PortalHeader title={title} subtitle={subtitle} logoUrl={logoUrl} />

      {/* Header ist jetzt `fixed` (echtes Liquid-Glass-Overlay, Inhalt scrollt
          sichtbar darunter durch), daher braucht der Rest der Seite hier oben
          Platz in Hoehe der Headerleiste (68px). */}
      <div className="flex flex-1 min-h-0 pt-[68px]">
        <aside className="hidden md:flex w-[260px] shrink-0 flex-col gap-1 p-4">
          <p className="px-4 py-1.5 text-xs font-medium text-grey-600 uppercase tracking-wide">Navigation</p>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="sidebar-link">
              {link.label}
            </Link>
          ))}
        </aside>

        <div className="content-panel flex-1 min-w-0 md:mr-5 mb-5 p-4 md:p-5">
          <nav className="flex md:hidden gap-2 mb-4 overflow-x-auto pb-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="chip chip-neutral whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </nav>
          {children}
          <footer className="mt-10 text-center text-xs text-grey-500 space-y-1">
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
