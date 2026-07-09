import Link from "next/link";
import { requirePortalUser } from "@/lib/portal-queries";

const STATUS_LABEL: Record<string, string> = {
  open: "Offen",
  submitted: "Eingereicht",
  accepted: "Akzeptiert",
  reopened: "Erneut geöffnet",
};

const STATUS_CHIP: Record<string, string> = {
  open: "chip-primary",
  submitted: "chip-warning",
  accepted: "chip-success",
  reopened: "chip-error",
};

export default async function PortalInputsPage() {
  const { supabase, clientId } = await requirePortalUser();
  const { data: requests } = await supabase
    .schema("portal")
    .from("input_requests")
    .select("id,title,status,due_date")
    .eq("client_id", clientId!)
    .in("status", ["open", "submitted", "accepted", "reopened"])
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-4">
      <h2 className="text-xl">Input-Anfragen</h2>

      {requests?.length ? (
        <div className="card">
          <div>
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/portal/inputs/${request.id}`}
                className="table-row flex items-center justify-between gap-3 px-6 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-grey-900 truncate">{request.title}</p>
                  <p className="text-xs text-grey-500">{request.due_date ? `Fällig: ${request.due_date}` : "Kein Fälligkeitsdatum"}</p>
                </div>
                <span className={`chip ${STATUS_CHIP[request.status] ?? "chip-neutral"} shrink-0`}>
                  {STATUS_LABEL[request.status] ?? request.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="stat-highlight p-8 text-center">
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-white/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-white" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-xl text-white font-semibold">Alles erledigt!</h3>
            <p className="text-secondary-200 text-sm max-w-sm">
              Sie haben aktuell keine offenen Input-Anfragen. Unser Team kümmert sich um den Rest — wir melden uns, sobald wir
              wieder etwas von Ihnen brauchen.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
