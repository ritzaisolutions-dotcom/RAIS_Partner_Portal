import { ReactNode } from "react";

type PortalPageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PortalPageHeader({ title, description, actions }: PortalPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[color-mix(in_srgb,var(--color-stone)_30%,transparent)]">
      <div className="min-w-0">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-charcoal)]">{title}</h1>
        {description ? <p className="mt-1 text-sm text-[var(--color-stone)] max-w-2xl">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
