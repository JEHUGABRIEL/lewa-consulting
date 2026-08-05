create table if not exists public.admin_users (
  id         text primary key default 'main',
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

comment on table public.admin_users is
  'Comptes administrateurs et invitations (stockés en JSONB), gérés depuis /admin.';
