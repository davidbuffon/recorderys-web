-- Permite representar "sin garantía" y corrige que warranty_until siempre
-- acabara siendo purchase_date + 3 años cuando no había fecha manual
-- (antes "Sin garantía" y "2 años" se guardaban igual: 3 años).

alter table public.items
  add column if not exists has_warranty boolean not null default true;

-- warranty_until es una columna generada. Para cambiar su expresión en
-- PostgreSQL 15/17 hay que recrearla: al borrarla se elimina también su índice,
-- que recreamos después. Las filas existentes se recalculan solas
-- (has_warranty = true por defecto, mismo resultado que antes de la migración).
alter table public.items drop column if exists warranty_until;

alter table public.items
  add column warranty_until date generated always as (
    case
      when has_warranty
        then coalesce(warranty_until_manual, (purchase_date + interval '3 years')::date)
      else null
    end
  ) stored;

create index if not exists items_warranty_until_idx on public.items(warranty_until);
