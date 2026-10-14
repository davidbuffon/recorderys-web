-- Motor de avisos: preferencias por usuario + registro de envíos.

-- Preferencias de avisos (hasta ahora solo vivían en localStorage y no hacían
-- nada en el servidor).
alter table public.profiles
  add column if not exists notify_return boolean not null default true,
  add column if not exists notify_warranty boolean not null default true;

-- Registro de avisos ya enviados, para no repetir el mismo aviso cada día que
-- corre el cron. Un aviso = (item, tipo, hito, canal).
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  kind text not null check (kind in ('return', 'warranty')),
  milestone text not null,
  channel text not null default 'email',
  sent_at timestamptz default now() not null,
  unique (item_id, kind, milestone, channel)
);

create index if not exists notifications_user_id_idx on public.notifications(user_id);

alter table public.notifications enable row level security;

-- Los usuarios pueden leer sus propios avisos. La inserción la hace el cron con
-- la service role (que salta la RLS), así que no hace falta política de insert.
drop policy if exists "Users can read their own notifications" on public.notifications;
create policy "Users can read their own notifications"
on public.notifications for select
using ((select auth.uid()) = user_id);
