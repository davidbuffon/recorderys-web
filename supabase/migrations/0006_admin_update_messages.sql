do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'Admins can update all messages'
  ) then
    create policy "Admins can update all messages"
    on public.messages for update
    using (
      exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
    with check (
      exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    );
  end if;
end $$;
