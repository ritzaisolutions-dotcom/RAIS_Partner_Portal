"use client";

import { useEffect, useState } from "react";

type PortalHeaderProps = {
  title: string;
  subtitle?: string;
  logoUrl?: string | null;
};

export function PortalHeader({ title, subtitle, logoUrl }: PortalHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`glass-header sticky top-0 z-20 ${scrolled ? "glass-header-scrolled" : ""}`}>
      <div className="h-[68px] flex items-center px-4 md:px-6 gap-4 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Kundenlogo" className="h-9 w-auto rounded" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/rais-logo.svg" alt="RAIS" className="h-9 w-9 shrink-0" />
          )}
          <div className="min-w-0">
            <h1 className="text-lg leading-tight truncate">{title}</h1>
            {subtitle ? <p className="text-xs text-grey-500 truncate">{subtitle}</p> : null}
          </div>
        </div>
        <form action="/auth/signout" method="post" className="shrink-0">
          <button type="submit" className="btn btn-ghost">
            Abmelden
          </button>
        </form>
      </div>
    </header>
  );
}
