export type ClientDocumentStatus = "draft" | "published";

export type ClientDocumentCategory =
  | "Rechnung"
  | "AVV"
  | "Service Agreement"
  | "Angebot"
  | "Mehrwert-Report"
  | "Sonstiges";

export const CLIENT_DOCUMENT_CATEGORIES: ClientDocumentCategory[] = [
  "Rechnung",
  "AVV",
  "Service Agreement",
  "Angebot",
  "Mehrwert-Report",
  "Sonstiges",
];

export const CLIENT_DOCUMENT_STATUS_LABEL: Record<ClientDocumentStatus, string> = {
  draft: "Entwurf",
  published: "Freigegeben",
};

export const CLIENT_DOCUMENT_STATUS_CHIP: Record<ClientDocumentStatus, string> = {
  draft: "chip-neutral",
  published: "chip-success",
};

export const CLIENT_DOCUMENT_CATEGORY_CHIP: Record<ClientDocumentCategory, string> = {
  Rechnung: "chip-warning",
  AVV: "chip-primary",
  "Service Agreement": "chip-primary",
  Angebot: "chip-primary",
  "Mehrwert-Report": "chip-success",
  Sonstiges: "chip-neutral",
};

export function isClientDocumentCategory(value: string): value is ClientDocumentCategory {
  return (CLIENT_DOCUMENT_CATEGORIES as string[]).includes(value);
}
