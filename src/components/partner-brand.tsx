type PartnerBrandProps = {
  compact?: boolean;
  alwaysShowWordmark?: boolean;
  size?: "default" | "login";
};

export function PartnerBrand({ compact = false, alwaysShowWordmark = false, size = "default" }: PartnerBrandProps) {
  if (compact) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/rais-partner-mark.svg" alt="RAIS Partner Portal" className="h-9 w-9 shrink-0" />
    );
  }

  const markSize = size === "login" ? "h-12 w-12" : "h-10 w-10";
  const titleSize = size === "login" ? "text-2xl" : "text-lg";
  const subtitleSize = size === "login" ? "text-sm" : "text-xs";
  const wordmarkVisibility = alwaysShowWordmark ? "" : "hidden sm:block";

  return (
    <div className="flex items-center gap-3 min-w-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/rais-partner-mark.svg" alt="" className={`${markSize} shrink-0`} aria-hidden="true" />
      <div className={`min-w-0 ${wordmarkVisibility}`}>
        <p className={`font-serif ${titleSize} font-semibold leading-tight text-[var(--color-charcoal)]`}>RAIS</p>
        <p className={`${subtitleSize} text-[var(--color-orange)]`}>Partner Portal</p>
      </div>
    </div>
  );
}
