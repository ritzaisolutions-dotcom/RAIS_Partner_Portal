-- Per-client document vault (invoices, contracts, reports) with draft/publish visibility.

alter table portal.client_users
  add column if not exists can_view_documents boolean not null default true;

create or replace function portal.can_view_documents() returns boolean
language sql stable security definer
set search_path = portal
as $$
  select coalesce((select can_view_documents from portal.client_users where user_id = auth.uid()), false);
$$;

revoke all on function portal.can_view_documents() from public;
grant execute on function portal.can_view_documents() to authenticated;

create table if not exists portal.client_documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references portal.clients(id) on delete cascade,
  uploaded_by uuid references auth.users(id),
  title text not null,
  category text not null check (
    category in ('Rechnung', 'AVV', 'Service Agreement', 'Angebot', 'Mehrwert-Report', 'Sonstiges')
  ),
  description_md text,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  byte_size bigint,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on portal.client_documents to authenticated;

alter table portal.client_documents enable row level security;

create policy "client_documents_admin_all" on portal.client_documents
for all to authenticated
using (portal.is_admin())
with check (portal.is_admin());

create policy "client_documents_client_select_published" on portal.client_documents
for select to authenticated
using (
  client_id = portal.my_client_id()
  and status = 'published'
  and portal.can_view_documents()
);

insert into storage.buckets (id, name, public)
values ('client-documents', 'client-documents', false)
on conflict (id) do nothing;

create policy "client_documents_storage_admin_all" on storage.objects
for all to authenticated
using (bucket_id = 'client-documents' and portal.is_admin())
with check (bucket_id = 'client-documents' and portal.is_admin());

create policy "client_documents_storage_client_select_own" on storage.objects
for select to authenticated
using (
  bucket_id = 'client-documents'
  and (
    portal.is_admin()
    or (
      split_part(name, '/', 1) = portal.my_client_id()::text
      and portal.can_view_documents()
    )
  )
);
