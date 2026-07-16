const defaultSchema = JSON.stringify(
  [
    { key: "feld_1", label: "Feld 1", type: "text", required: true },
    { key: "feld_2", label: "Feld 2", type: "textarea", required: false },
  ],
  null,
  2,
);

export default async function NewInputRequestPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  return (
    <section className="space-y-4">
      <h2 className="text-xl">Neue Input-Anfrage</h2>
      <form action={`/admin/clients/${id}/inputs/new/create`} method="post" className="portal-card portal-card-body space-y-4">
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="title">
            Titel
          </label>
          <input id="title" name="title" required />
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="description_md">
            Beschreibung
          </label>
          <textarea id="description_md" name="description_md" rows={8} />
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="kind">
            Typ
          </label>
          <select id="kind" name="kind" defaultValue="form">
            <option value="form">Formular</option>
            <option value="freetext">Freitext</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="form_schema">
            Formular-Schema (JSON)
          </label>
          <textarea id="form_schema" name="form_schema" rows={10} defaultValue={defaultSchema} className="font-mono text-xs" />
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="due_date">
            Fälligkeitsdatum
          </label>
          <input id="due_date" name="due_date" type="date" min={today} />
        </div>
        <div>
          <label className="block text-xs text-grey-600 mb-1" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" defaultValue="draft">
            <option value="draft">Entwurf</option>
            <option value="open">Offen</option>
          </select>
        </div>
        {resolvedSearch.error ? <p className="chip chip-error">{resolvedSearch.error}</p> : null}
        {resolvedSearch.success ? <p className="chip chip-success">{resolvedSearch.success}</p> : null}
        <button type="submit" className="btn btn-primary">
          Input-Anfrage speichern
        </button>
      </form>
    </section>
  );
}
