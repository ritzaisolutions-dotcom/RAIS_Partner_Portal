import { ReactNode } from "react";

type StitchFilterPanelProps = {
  children: ReactNode;
};

export function StitchFilterPanel({ children }: StitchFilterPanelProps) {
  return (
    <section className="portal-card p-6 md:p-8 mb-6">
      <div className="flex flex-wrap gap-4 items-end">{children}</div>
    </section>
  );
}

type StitchFilterFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
};

export function StitchFilterField({ label, htmlFor, children }: StitchFilterFieldProps) {
  return (
    <div className="flex flex-col gap-2 min-w-[10rem] flex-1">
      <label htmlFor={htmlFor} className="login-label">
        {label}
      </label>
      {children}
    </div>
  );
}
