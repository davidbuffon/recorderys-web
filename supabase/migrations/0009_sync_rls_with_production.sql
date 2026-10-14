-- Reconcilia las políticas RLS del repositorio con el estado real de producción.
--
-- Contexto: en producción la política recursiva "Admins can read all profiles"
-- (0001), que consultaba public.profiles dentro de una política sobre
-- public.profiles, se sustituyó manualmente por una función is_admin()
-- SECURITY DEFINER y un conjunto de políticas consolidadas. Las migraciones
-- 0001/0002/0006 todavía recreaban la versión recursiva, así que un entorno
-- nuevo volvería a tener el bug (error 42P17: infinite recursion). Esta
-- migración deja cualquier base de datos en el mismo estado ya verificado en
-- producción el 2026-10-14. Es idempotente: se puede aplicar sobre un entorno
-- nuevo o sobre uno ya migrado.

-- 1. Función de comprobación de admin, SECURITY DEFINER (evita la recursión
--    porque se ejecuta sin RLS) y con search_path fijo.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 2. profiles
drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Admins can read all profiles" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

drop policy if exists "Users and admins can view profiles" on public.profiles;
create policy "Users and admins can view profiles"
on public.profiles for select
using ((select auth.uid()) = id or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- 3. categories
drop policy if exists "Everyone can read active categories" on public.categories;

drop policy if exists "Authenticated users can read categories" on public.categories;
create policy "Authenticated users can read categories"
on public.categories for select
using ((select auth.role()) = 'authenticated');

drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
on public.categories for insert
with check (public.is_admin());

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
on public.categories for update
using (public.is_admin());

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
on public.categories for delete
using (public.is_admin());

-- 4. messages
drop policy if exists "Users can read their own messages" on public.messages;
drop policy if exists "Admins can read all messages" on public.messages;
drop policy if exists "Users can update their own messages" on public.messages;
drop policy if exists "Users can insert their own messages" on public.messages;

drop policy if exists "Users and admins can view messages" on public.messages;
create policy "Users and admins can view messages"
on public.messages for select
using ((select auth.uid()) = user_id or public.is_admin());

drop policy if exists "Users can insert own messages" on public.messages;
create policy "Users can insert own messages"
on public.messages for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "Admins can update all messages" on public.messages;
create policy "Admins can update all messages"
on public.messages for update
using (public.is_admin())
with check (public.is_admin());

-- 5. receipts
drop policy if exists "Users can read their own receipts" on public.receipts;
drop policy if exists "Admins can read all receipts" on public.receipts;
drop policy if exists "Users can update their own receipts" on public.receipts;
drop policy if exists "Admins can update all receipts" on public.receipts;

drop policy if exists "Users and admins can read receipts" on public.receipts;
create policy "Users and admins can read receipts"
on public.receipts for select
using ((select auth.uid()) = owner_user_id or public.is_admin());

drop policy if exists "Users and admins can update receipts" on public.receipts;
create policy "Users and admins can update receipts"
on public.receipts for update
using ((select auth.uid()) = owner_user_id or public.is_admin());

drop policy if exists "Users can insert their own receipts" on public.receipts;
create policy "Users can insert their own receipts"
on public.receipts for insert
with check ((select auth.uid()) = owner_user_id);
