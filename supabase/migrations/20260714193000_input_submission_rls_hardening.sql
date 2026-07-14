-- Harden input submission RLS and submissions storage permissions.

drop policy if exists "input_submissions_client_insert_own" on portal.input_submissions;
create policy "input_submissions_client_insert_own" on portal.input_submissions
for insert to authenticated
with check (
  client_id = portal.my_client_id()
  and submitted_by = auth.uid()
  and portal.can_view_inputs()
  and exists (
    select 1
    from portal.input_requests ir
    where ir.id = request_id
      and ir.client_id = portal.my_client_id()
      and ir.status in ('open', 'reopened')
  )
);

drop policy if exists "submissions_client_select_own" on storage.objects;
create policy "submissions_client_select_own" on storage.objects
for select to authenticated
using (
  bucket_id = 'submissions'
  and (
    portal.is_admin()
    or (
      split_part(name, '/', 1) = portal.my_client_id()::text
      and portal.can_view_inputs()
    )
  )
);

drop policy if exists "submissions_client_insert_own" on storage.objects;
create policy "submissions_client_insert_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'submissions'
  and (
    portal.is_admin()
    or (
      split_part(name, '/', 1) = portal.my_client_id()::text
      and portal.can_view_inputs()
    )
  )
);
