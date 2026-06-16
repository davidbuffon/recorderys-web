create extension if not exists "pgcrypto";

create type public.auth_provider as enum ('google', 'apple', 'email');
create type public.item_status as enum ('active', 'returned', 'claim', 'resolved', 'archived');
create type public.date_source as enum ('manual', 'estimated', 'legal_estimate', 'confirmed', 'undefined');
create type public.message_status as enum ('open', 'in_progress', 'closed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text not null,
  avatar_url text,
  auth_provider public.auth_provider default 'email' not null,
  phone text,
  address text,
  role text default 'user' not null check (role in ('user', 'admin')),
  created_at timestamptz default now() not null,
  last_login timestamptz
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  icon text,
  color text,
  sort_order integer default 0 not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null
);

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id),
  name text not null,
  description text,
  ai_description text,
  brand text,
  model text,
  serial_number text,
  store text,
  purchase_date date not null,
  return_until date,
  warranty_until_manual date,
  warranty_until_generated date generated always as ((purchase_date + interval '3 years')::date) stored,
  warranty_until date generated always as (coalesce(warranty_until_manual, (purchase_date + interval '3 years')::date)) stored,
  warranty_source public.date_source default 'legal_estimate' not null,
  return_source public.date_source default 'undefined' not null,
  status public.item_status default 'active' not null,
  photo_path text,
  receipt_path text,
  receipt_text text,
  ai_category_name text,
  ai_confidence numeric(4, 3),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid references public.items(id) on delete set null,
  subject text not null,
  body text not null,
  attachment_path text,
  status public.message_status default 'open' not null,
  admin_response text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index items_user_id_idx on public.items(user_id);
create index items_category_id_idx on public.items(category_id);
create index items_purchase_date_idx on public.items(purchase_date desc);
create index items_warranty_until_idx on public.items(warranty_until);
create index items_search_idx on public.items using gin (
  to_tsvector(
    'simple',
    coalesce(name, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(brand, '') || ' ' ||
    coalesce(model, '') || ' ' ||
    coalesce(serial_number, '') || ' ' ||
    coalesce(store, '') || ' ' ||
    coalesce(receipt_text, '')
  )
);
create index messages_user_id_idx on public.messages(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_items_updated_at
before update on public.items
for each row execute function public.set_updated_at();

create trigger set_messages_updated_at
before update on public.messages
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  provider_name text;
begin
  provider_name := coalesce(new.raw_app_meta_data ->> 'provider', 'email');

  insert into public.profiles (id, name, email, avatar_url, auth_provider, created_at, last_login)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url',
    case
      when provider_name = 'google' then 'google'::public.auth_provider
      when provider_name = 'apple' then 'apple'::public.auth_provider
      else 'email'::public.auth_provider
    end,
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    last_login = now();

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.items enable row level security;
alter table public.messages enable row level security;

create policy "Users can read their own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins can read all profiles"
on public.profiles for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Everyone can read active categories"
on public.categories for select
using (is_active = true);

create policy "Users can read their own items"
on public.items for select
using (auth.uid() = user_id);

create policy "Users can insert their own items"
on public.items for insert
with check (auth.uid() = user_id);

create policy "Users can update their own items"
on public.items for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own items"
on public.items for delete
using (auth.uid() = user_id);

create policy "Users can read their own messages"
on public.messages for select
using (auth.uid() = user_id);

create policy "Users can insert their own messages"
on public.messages for insert
with check (auth.uid() = user_id);

create policy "Users can update their own messages"
on public.messages for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins can read all messages"
on public.messages for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

insert into storage.buckets (id, name, public)
values
  ('item-photos', 'item-photos', false),
  ('receipts', 'receipts', false),
  ('message-attachments', 'message-attachments', false)
on conflict (id) do nothing;

create policy "Users can read their item photos"
on storage.objects for select
using (
  bucket_id = 'item-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload their item photos"
on storage.objects for insert
with check (
  bucket_id = 'item-photos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can read their receipts"
on storage.objects for select
using (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload their receipts"
on storage.objects for insert
with check (
  bucket_id = 'receipts'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can read their message attachments"
on storage.objects for select
using (
  bucket_id = 'message-attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload their message attachments"
on storage.objects for insert
with check (
  bucket_id = 'message-attachments'
  and auth.uid()::text = (storage.foldername(name))[1]
);
