import clsx from "clsx";
import type { ReactNode } from "react";

type PortalNavIconProps = {
  href?: string;
  name?: "logout";
  className?: string;
};

function IconBase({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx("h-[18px] w-[18px] shrink-0", className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function resolveIconKey(href: string | undefined, name: PortalNavIconProps["name"]) {
  if (name === "logout") return "logout";
  if (!href) return "default";

  if (href === "/portal") return "portal-overview";
  if (href.startsWith("/portal/reports")) return "portal-reports";
  if (href.startsWith("/portal/inputs")) return "portal-inputs";
  if (href.startsWith("/portal/requests")) return "portal-requests";
  if (href.startsWith("/portal/documents")) return "portal-documents";

  if (href === "/admin") return "admin-partners";
  if (href.startsWith("/admin/requests")) return "admin-requests";
  if (href.startsWith("/admin/documents")) return "admin-documents";
  if (href.startsWith("/admin/clients/new")) return "admin-new-partner";
  if (href.startsWith("/admin/users")) return "admin-users";

  return "default";
}

export function PortalNavIcon({ href, name, className }: PortalNavIconProps) {
  const iconKey = resolveIconKey(href, name);

  switch (iconKey) {
    case "portal-overview":
      return (
        <IconBase className={className}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </IconBase>
      );
    case "portal-reports":
      return (
        <IconBase className={className}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 17V9" />
          <path d="M12 17V7" />
          <path d="M16 17v-5" />
        </IconBase>
      );
    case "portal-inputs":
      return (
        <IconBase className={className}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </IconBase>
      );
    case "portal-requests":
      return (
        <IconBase className={className}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </IconBase>
      );
    case "portal-documents":
      return (
        <IconBase className={className}>
          <path d="M4 20h16a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2v14z" />
          <path d="M14 2v6h6" />
        </IconBase>
      );
    case "admin-partners":
      return (
        <IconBase className={className}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </IconBase>
      );
    case "admin-requests":
      return (
        <IconBase className={className}>
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </IconBase>
      );
    case "admin-documents":
      return (
        <IconBase className={className}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </IconBase>
      );
    case "admin-new-partner":
      return (
        <IconBase className={className}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6" />
          <path d="M16 11h6" />
        </IconBase>
      );
    case "admin-users":
      return (
        <IconBase className={className}>
          <circle cx="7.5" cy="15.5" r="5.5" />
          <path d="m21 2-9.6 9.6" />
          <path d="m15.5 7.5 3 3L22 7l-3-3" />
        </IconBase>
      );
    case "logout":
      return (
        <IconBase className={className}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
        </IconBase>
      );
    default:
      return (
        <IconBase className={className}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </IconBase>
      );
  }
}
