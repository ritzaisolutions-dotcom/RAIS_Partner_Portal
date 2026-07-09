import { notFound } from "next/navigation";
import { requireAdminUser } from "@/lib/portal-queries";

export default async function EditInputRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; requestId: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id, requestId } = await params;
  const resolvedSearch = await searchParams;
  const { supabase } = await requireAdminUser();
  const portal = supabase.schema("portal");
  const { data: request } = await portal
    .from("input_requests")
    .select("id,title,description_md,kind,form_schema,due_date,status")
    .eq("id", requestId)
    .eq("client_id", id)
    .maybeSingle();

  if (!request) notFound();

  const formSchemaText = request.form_schema ? JSON.stringify(request.form_schema, null, 2) : "[]";
  const today = new Date().toISOString().slice(0, 10);
  // min darf ein bereits in der Vergangenheit liegendes Fälligkeitsdatum nicht verstecken/blockieren -
  // sonst laesst sich ein ueberfaelliger Termin nicht mehr unveraendert speichern.
  const dueDateMin = request.due_date && request.due_date < today ? request.due_date : today;

  return (
    <section className="space-y-4">
      <h2 className="text-xl">Input-Anfrage bearbeiten</h2>
      <form action={`/admin/clients/${id}/inputs/${requestId}/edit/update`} method="post" className="card card-content space-y-4">
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="title">
            Titel
          </label>
          <input id="title" name="title" required defaultValue={request.title} />
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="description_md">
            Beschreibung
          </label>
          <textarea id="description_md" name="description_md" rows={8} defaultValue={request.description_md ?? ""} />
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="kind">
            Typ
          </label>
          <select id="kind" name="kind" defaultValue={request.kind}>
            <option value="form">Formular</option>
            <option value="freetext">Freitext</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="form_schema">
            Formular-Schema (JSON)
          </label>
          <textarea id="form_schema" name="form_schema" rows={10} defaultValue={formSchemaText} className="font-mono text-xs" />
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="due_date">
            Fälligkeitsdatum
          </label>
          <input id="due_date" name="due_date" type="date" defaultValue={request.due_date ?? ""} min={dueDateMin} />
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" defaultValue={request.status}>
            <option value="draft">Entwurf</option>
            <option value="open">Offen</option>
            <option value="submitted">Eingereicht</option>
            <option value="accepted">Akzeptiert</option>
            <option value="reopened">Erneut geöffnet</option>
          </select>
        </div>
        {resolvedSearch.error ? <p className="chip chip-error">{resolvedSearch.error}</p> : null}
        {resolvedSearch.success ? <p className="chip chip-success">{resolvedSearch.success}</p> : null}
        <button type="submit" className="btn btn-primary">
          Änderungen speichern
        </button>
      </form>
    </section>
  );
}
