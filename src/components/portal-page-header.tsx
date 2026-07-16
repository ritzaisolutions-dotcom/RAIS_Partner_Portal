import { ReactNode } from "react";

type PortalPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PortalPageHeader({ eyebrow, title, description, actions }: PortalPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-[var(--border)]">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="login-label mb-2">{eyebrow}</p>
        ) : null}
        <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-[-0.02em] text-[var(--color-charcoal)]">
          {title}
        </h1>
        {description ? <p className="mt-2 text-sm text-[var(--color-stone)] max-w-2xl">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
