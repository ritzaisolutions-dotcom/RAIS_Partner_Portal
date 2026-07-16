type PartnerBrandProps = {
  compact?: boolean;
};

export function PartnerBrand({ compact = false }: PartnerBrandProps) {
  if (compact) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/rais-partner-mark.svg" alt="RAIS Partner Portal" className="h-9 w-9 shrink-0" />
    );
  }

  return (
    <div className="flex items-center gap-3 min-w-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/rais-partner-mark.svg" alt="" className="h-10 w-10 shrink-0" aria-hidden="true" />
      <div className="min-w-0 hidden sm:block">
        <p className="font-serif text-lg font-semibold leading-tight text-[var(--color-charcoal)]">RAIS</p>
        <p className="text-xs text-[var(--color-orange)]">Partner Portal</p>
      </div>
    </div>
  );
}
