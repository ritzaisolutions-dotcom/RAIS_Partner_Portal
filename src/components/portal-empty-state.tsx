import Link from "next/link";
import { ReactNode } from "react";

type PortalEmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PortalEmptyState({ icon, title, description, action }: PortalEmptyStateProps) {
  return (
    <div className="portal-empty flex flex-col items-center">
      {icon ? <span className="portal-empty-icon" aria-hidden="true">{icon}</span> : null}
      <h3 className="font-serif text-lg font-semibold text-[var(--color-charcoal)]">{title}</h3>
      {description ? <p className="text-sm text-[var(--color-stone)] mt-2 max-w-md">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

type PortalEmptyLinkProps = {
  href: string;
  label: string;
};

export function PortalEmptyLink({ href, label }: PortalEmptyLinkProps) {
  return (
    <Link href={href} className="text-[var(--color-rust)] font-semibold underline-offset-2 hover:underline">
      {label}
    </Link>
  );
}
