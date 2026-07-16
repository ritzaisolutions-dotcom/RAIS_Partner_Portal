import Link from "next/link";
import { ReactNode } from "react";
import { PartnerBrand } from "./partner-brand";

type PublicLegalLayoutProps = {
  title: string;
  children: ReactNode;
};

export function PublicLegalLayout({ title, children }: PublicLegalLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--color-linen)]">
      <header className="border-b border-[color-mix(in_srgb,var(--color-stone)_30%,transparent)] bg-[var(--surface)]">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <Link href="/login">
            <PartnerBrand />
          </Link>
          <Link href="/login" className="text-sm font-medium text-[var(--color-stone)] hover:text-[var(--color-charcoal)]">
            Zum Login
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight text-[var(--color-charcoal)]">
          {title}
        </h1>
        {children}
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-8 text-center text-xs text-[var(--color-stone)] space-y-1 border-t border-[color-mix(in_srgb,var(--color-stone)_30%,transparent)]">
        <p className="space-x-3">
          <Link href="/login" className="underline-offset-2 hover:underline">
            Login
          </Link>
          <Link href="/impressum" className="underline-offset-2 hover:underline">
            Impressum
          </Link>
          <Link href="/datenschutz" className="underline-offset-2 hover:underline">
            Datenschutz
          </Link>
        </p>
        <p>Powered by RAIS</p>
      </footer>
    </div>
  );
}
