alter table public.receipts
add column if not exists extracted_store text,
add column if not exists extracted_purchase_date date,
add column if not exists extracted_total_amount numeric(10,2),
add column if not exists extracted_ticket_number text,
add column if not exists extracted_payment_tail text,
add column if not exists ocr_status text default 'pending' not null check (ocr_status in ('pending', 'processed', 'failed')),
add column if not exists extraction_confidence integer default 0 not null check (extraction_confidence >= 0 and extraction_confidence <= 100);
