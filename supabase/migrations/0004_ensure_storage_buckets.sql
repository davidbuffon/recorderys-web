insert into storage.buckets (id, name, public)
values
  ('item-photos', 'item-photos', false),
  ('receipts', 'receipts', false),
  ('message-attachments', 'message-attachments', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can read their item photos'
  ) then
    create policy "Users can read their item photos"
    on storage.objects for select
    using (
      bucket_id = 'item-photos'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload their item photos'
  ) then
    create policy "Users can upload their item photos"
    on storage.objects for insert
    with check (
      bucket_id = 'item-photos'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can read their receipts'
  ) then
    create policy "Users can read their receipts"
    on storage.objects for select
    using (
      bucket_id = 'receipts'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload their receipts'
  ) then
    create policy "Users can upload their receipts"
    on storage.objects for insert
    with check (
      bucket_id = 'receipts'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can read their message attachments'
  ) then
    create policy "Users can read their message attachments"
    on storage.objects for select
    using (
      bucket_id = 'message-attachments'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload their message attachments'
  ) then
    create policy "Users can upload their message attachments"
    on storage.objects for insert
    with check (
      bucket_id = 'message-attachments'
      and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;
end $$;
