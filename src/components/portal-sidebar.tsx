"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppShellVariant } from "./app-shell-variant";
import { PortalNavIcon } from "./portal-nav-icon";

type PortalSidebarProps = {
  links: Array<{ href: string; label: string }>;
  variant: AppShellVariant;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/portal") return pathname === "/portal";
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalSidebar({ links, variant }: PortalSidebarProps) {
  const pathname = usePathname();
  const consoleLabel = variant === "admin" ? "Management Console" : "Partner Portal";

  return (
    <aside className="hidden md:flex fixed left-0 top-[68px] z-40 h-[calc(100vh-68px)] w-64 flex-col border-r border-[var(--border)] bg-[var(--color-linen-soft)] py-6 px-3">
      <div className="mb-6 px-2">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rais-partner-mark.svg" alt="" className="h-10 w-10 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-serif text-lg font-semibold leading-tight text-[var(--color-charcoal)]">RAIS</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-stone)]">{consoleLabel}</p>
          </div>
        </div>
      </div>

      <p className="portal-nav-label px-3 mb-2">Navigation</p>
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {links.map((link) => {
          const active = isActivePath(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? "portal-sidebar-link portal-sidebar-link-active gap-3" : "portal-sidebar-link gap-3"}
            >
              <PortalNavIcon href={link.href} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <form action="/auth/signout" method="post" className="mt-4 pt-4 border-t border-[var(--border)] px-1">
        <button type="submit" className="portal-sidebar-link w-full gap-3 text-left">
          <PortalNavIcon name="logout" />
          <span>Abmelden</span>
        </button>
      </form>
    </aside>
  );
}
