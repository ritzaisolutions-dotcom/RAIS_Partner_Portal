"use client";

import { PartnerBrand } from "./partner-brand";
import type { AppShellVariant } from "./app-shell-variant";

type PortalHeaderProps = {
  title: string;
  subtitle?: string;
  logoUrl?: string | null;
  variant: AppShellVariant;
};

export function PortalHeader({ title, subtitle, logoUrl, variant }: PortalHeaderProps) {
  return (
    <header className="portal-header fixed top-0 left-0 right-0 z-30">
      <div className="h-[68px] flex items-center px-4 md:px-6 gap-4 justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <PartnerBrand />
          <div className="h-8 w-px bg-[color-mix(in_srgb,var(--color-stone)_30%,transparent)] hidden sm:block" />
          <div className="min-w-0 hidden sm:block">
            <p className="text-sm font-semibold text-[var(--color-charcoal)] truncate">{title}</p>
            {subtitle ? <p className="text-xs text-[var(--color-stone)] truncate">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {variant === "portal" && logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Kundenlogo" className="h-8 w-auto rounded hidden md:block" />
          ) : null}
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn btn-ghost !text-xs">
              Abmelden
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
