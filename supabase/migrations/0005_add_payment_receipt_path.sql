alter table public.items
add column if not exists payment_receipt_path text;
