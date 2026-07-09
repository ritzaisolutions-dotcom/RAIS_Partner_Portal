import Link from "next/link";
import { requireAdminUser } from "@/lib/portal-queries";

export default async function AdminHomePage() {
  const { supabase } = await requireAdminUser();
  const { data: clients } = await supabase.schema("portal").from("clients").select("id,name,slug,primary_contact_email").order("created_at");

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Kunden</h2>
        <Link href="/admin/clients/new" className="btn btn-primary">
          + Neuer Kunde
        </Link>
      </div>

      <div className="card">
        <div className="card-header">Alle Kunden</div>
        {clients?.length ? (
          <div>
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/admin/clients/${client.id}`}
                className="table-row flex items-center gap-3 px-6 py-3 last:border-b-0"
              >
                <div className="h-9 w-9 rounded-lg bg-primary-light text-primary-dark flex items-center justify-center font-semibold shrink-0">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-grey-900 truncate">{client.name}</p>
                  <p className="text-xs text-grey-500 truncate">
                    Slug: {client.slug}
                    {client.primary_contact_email ? ` · ${client.primary_contact_email}` : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-content text-grey-500">Noch keine Kunden angelegt.</div>
        )}
      </div>
    </section>
  );
}
