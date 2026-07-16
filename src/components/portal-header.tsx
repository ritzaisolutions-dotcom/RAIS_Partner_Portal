"use client";

import { PartnerBrand } from "./partner-brand";
import type { AppShellVariant } from "./app-shell-variant";

type PortalHeaderProps = {
  title: string;
  subtitle?: string;
  logoUrl?: string | null;
  variant: AppShellVariant;
  identityName?: string;
  identityRole?: string;
};

function identityInitial(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function PortalHeader({
  title,
  subtitle,
  logoUrl,
  variant,
  identityName,
  identityRole,
}: PortalHeaderProps) {
  const displayName = identityName ?? (variant === "admin" ? "Admin" : "Partner");
  const roleLabel = identityRole ?? (variant === "admin" ? "Administrator" : "Partner Portal");

  return (
    <header className="portal-header fixed top-0 left-0 right-0 z-50">
      <div className="h-[68px] flex items-center justify-between gap-4 px-4 md:px-10 w-full">
        {variant === "admin" ? (
          <div className="flex items-center gap-4 min-w-0">
            <PartnerBrand alwaysShowWordmark />
            <div className="h-8 w-px bg-[var(--border)] hidden sm:block shrink-0" />
            {subtitle ? (
              <span className="hidden md:block text-xs font-semibold uppercase tracking-widest text-[var(--color-stone)] truncate">
                {subtitle}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-4 min-w-0">
            <PartnerBrand alwaysShowWordmark />
            <div className="h-8 w-px bg-[var(--border)] hidden sm:block shrink-0" />
            <div className="min-w-0 hidden sm:block">
              <p className="text-sm font-semibold text-[var(--color-charcoal)] truncate">{title}</p>
              {subtitle ? <p className="text-xs text-[var(--color-stone)] truncate">{subtitle}</p> : null}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 shrink-0">
          {variant === "portal" && logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Partnerlogo" className="h-8 w-auto rounded hidden lg:block" />
          ) : null}
          <div className="hidden sm:flex items-center gap-3 pr-1 border-r border-[var(--border)]">
            <div
              className="h-9 w-9 rounded-full bg-[var(--color-linen-soft)] border border-[var(--border)] flex items-center justify-center text-sm font-semibold text-[var(--color-charcoal)] shrink-0"
              aria-hidden="true"
            >
              {identityInitial(displayName)}
            </div>
            <div className="min-w-0 hidden md:block">
              <p className="text-sm font-semibold text-[var(--color-charcoal)] truncate max-w-[10rem]">{displayName}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-stone)] truncate">
                {roleLabel}
              </p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn btn-secondary !text-xs">
              Abmelden
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
