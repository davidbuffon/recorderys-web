create type public.duplicate_status as enum (
  'clear',
  'possible_duplicate',
  'confirmed_duplicate',
  'under_review'
);

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null unique references public.items(id) on delete cascade,
  storage_path text not null,
  original_filename text,
  mime_type text,
  file_size bigint,
  file_sha256 text not null,
  metadata_fingerprint text,
  normalized_store text,
  normalized_purchase_date date,
  duplicate_status public.duplicate_status default 'clear' not null,
  trust_score integer default 100 not null check (trust_score >= 0 and trust_score <= 100),
  duplicate_of_receipt_id uuid references public.receipts(id) on delete set null,
  review_notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index receipts_owner_user_id_idx on public.receipts(owner_user_id);
create index receipts_item_id_idx on public.receipts(item_id);
create index receipts_file_sha256_idx on public.receipts(file_sha256);
create index receipts_metadata_fingerprint_idx on public.receipts(metadata_fingerprint);
create index receipts_duplicate_status_idx on public.receipts(duplicate_status);

create trigger set_receipts_updated_at
before update on public.receipts
for each row execute function public.set_updated_at();

alter table public.receipts enable row level security;

create policy "Users can read their own receipts"
on public.receipts for select
using (auth.uid() = owner_user_id);

create policy "Users can insert their own receipts"
on public.receipts for insert
with check (auth.uid() = owner_user_id);

create policy "Users can update their own receipts"
on public.receipts for update
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

create policy "Admins can read all receipts"
on public.receipts for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create policy "Admins can update all receipts"
on public.receipts for update
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
