"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppShellVariant } from "./app-shell-variant";

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
  const sidebarSubtitle = variant === "admin" ? "Administration" : "Partner Portal";

  return (
    <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-[color-mix(in_srgb,var(--color-stone)_30%,transparent)] bg-[var(--color-linen-soft)] py-6 px-3">
      <div className="mb-6 px-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rais-partner-mark.svg" alt="" className="h-10 w-10 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-serif text-lg font-semibold leading-tight text-[var(--color-charcoal)]">RAIS</p>
            <p className="text-xs text-[var(--color-orange)]">{sidebarSubtitle}</p>
          </div>
        </div>
      </div>
      <p className="portal-nav-label px-3 mb-2">Navigation</p>
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const active = isActivePath(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? "portal-sidebar-link portal-sidebar-link-active" : "portal-sidebar-link"}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
