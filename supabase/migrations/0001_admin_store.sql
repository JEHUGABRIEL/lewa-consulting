

create table if not exists public.admin_store (
  id         text primary key default 'main',
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_store enable row level security;

comment on table public.admin_store is
  'Contenu du site géré depuis le dashboard /admin (stocké en JSONB).';
