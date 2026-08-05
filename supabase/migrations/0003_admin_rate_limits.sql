-- ---------------------------------------------------------------------------
-- Table partagée pour les compteurs de débit et verrouillages brute-force.
-- Remplace les fichiers JSON locaux (admin-login-attempts.json,
-- admin-otp-rate.json) qui ne persistent pas sur un déploiement serverless
-- et ne se synchronisent pas entre instances.
--
-- Chaque ligne porte une clé arbitraire (IP, nom d'utilisateur, email…) et
-- un JSONB de compteurs. expires_at permet un nettoyage passif : toute ligne
-- dont expires_at < now() est ignorée par les RPCs et peut être purgée.
-- ---------------------------------------------------------------------------

create table if not exists public.admin_rate_limits (
  key        text        primary key,
  data       jsonb       not null,
  expires_at timestamptz not null
);

alter table public.admin_rate_limits enable row level security;
-- Aucune policy → deny-all pour les rôles anon/authenticated.
-- L'application accède via la clé service (SUPABASE_SECRET_KEY) qui bypass RLS.

comment on table public.admin_rate_limits is
  'Compteurs de débit et verrouillages brute-force admin (partagés entre instances).';

-- Index d'expiration pour les purges et les sélections filtrées.
create index if not exists admin_rate_limits_expires_at_idx
  on public.admin_rate_limits (expires_at);

-- ---------------------------------------------------------------------------
-- RPC : fenêtre fixe — incrémente et teste le compteur de façon atomique.
-- Retourne un objet JSON { allowed, remaining, retryAfterMs }.
-- ---------------------------------------------------------------------------
create or replace function public.rate_limit_consume(
  p_key    text,
  p_max    int,
  p_window bigint  -- durée de la fenêtre en millisecondes
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_now     timestamptz := clock_timestamp();
  v_now_ms  bigint      := (extract(epoch from v_now) * 1000)::bigint;
  v_entry   jsonb;
  v_count   int;
  v_first   bigint;
  v_expires timestamptz;
begin
  -- Lecture avec verrouillage pessimiste ; skip locked évite les deadlocks
  -- entre requêtes simultanées sur des clés différentes.
  select data into v_entry
  from public.admin_rate_limits
  where key = p_key
    and expires_at > v_now
  for update skip locked;

  if v_entry is null then
    -- Première entrée dans la fenêtre.
    v_expires := v_now + make_interval(secs => p_window::float / 1000);
    insert into public.admin_rate_limits (key, data, expires_at)
    values (
      p_key,
      jsonb_build_object('count', 1, 'firstAt', v_now_ms),
      v_expires
    )
    on conflict (key) do update
      set data       = excluded.data,
          expires_at = excluded.expires_at;
    return jsonb_build_object('allowed', true, 'remaining', p_max - 1, 'retryAfterMs', 0);
  end if;

  v_count := (v_entry ->> 'count')::int;
  v_first := (v_entry ->> 'firstAt')::bigint;

  if v_count >= p_max then
    return jsonb_build_object(
      'allowed',      false,
      'remaining',    0,
      'retryAfterMs', greatest(0, v_first + p_window - v_now_ms)
    );
  end if;

  update public.admin_rate_limits
  set data = jsonb_set(v_entry, '{count}', to_jsonb(v_count + 1))
  where key = p_key;

  return jsonb_build_object(
    'allowed',      true,
    'remaining',    p_max - v_count - 1,
    'retryAfterMs', 0
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC : réinitialise un compteur (après une action réussie).
-- ---------------------------------------------------------------------------
create or replace function public.rate_limit_reset(p_key text)
returns void
language plpgsql
security definer
as $$
begin
  delete from public.admin_rate_limits where key = p_key;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC : enregistre un échec de connexion avec verrouillage exponentiel simple.
-- Retourne le timestamp (ms epoch) jusqu'auquel le compte est verrouillé,
-- ou 0 si pas encore verrouillé.
-- ---------------------------------------------------------------------------
create or replace function public.login_record_failure(
  p_key    text,
  p_max    int,
  p_window bigint  -- fenêtre de comptage en ms (ex. 15 * 60 * 1000)
)
returns bigint
language plpgsql
security definer
as $$
declare
  v_now     timestamptz := clock_timestamp();
  v_now_ms  bigint      := (extract(epoch from v_now) * 1000)::bigint;
  v_entry   jsonb;
  v_count   int         := 0;
  v_last_ms bigint      := 0;
  v_locked  bigint      := 0;
  v_expires timestamptz;
begin
  select data into v_entry
  from public.admin_rate_limits
  where key = p_key
  for update skip locked;

  if v_entry is not null then
    v_count   := (v_entry ->> 'count')::int;
    v_last_ms := (v_entry ->> 'lastAt')::bigint;
    v_locked  := (v_entry ->> 'lockedUntil')::bigint;

    -- Si hors fenêtre et non verrouillé, recommencer à zéro.
    if v_now_ms - v_last_ms > p_window and v_locked <= v_now_ms then
      v_count := 0;
    end if;
  end if;

  v_count := v_count + 1;
  v_locked := case when v_count >= p_max then v_now_ms + p_window else 0 end;

  -- Conserver la ligne au moins deux fenêtres pour que clearLoginFailures
  -- puisse faire un delete propre même après l'expiration du verrou.
  v_expires := v_now + make_interval(secs => (p_window * 2)::float / 1000);

  insert into public.admin_rate_limits (key, data, expires_at)
  values (
    p_key,
    jsonb_build_object('count', v_count, 'lastAt', v_now_ms, 'lockedUntil', v_locked),
    v_expires
  )
  on conflict (key) do update
    set data       = excluded.data,
        expires_at = excluded.expires_at;

  return v_locked;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC : retourne le nombre de millisecondes restant avant déverrouillage,
-- ou 0 si la clé n'existe pas / n'est pas verrouillée.
-- ---------------------------------------------------------------------------
create or replace function public.login_lock_remaining_ms(p_key text)
returns bigint
language plpgsql
security definer
as $$
declare
  v_now_ms bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  v_entry  jsonb;
  v_locked bigint;
begin
  select data into v_entry
  from public.admin_rate_limits
  where key = p_key
    and expires_at > clock_timestamp();

  if v_entry is null then return 0; end if;
  v_locked := (v_entry ->> 'lockedUntil')::bigint;
  return greatest(0, v_locked - v_now_ms);
end;
$$;

-- ---------------------------------------------------------------------------
-- Purge périodique (appelable manuellement ou via un cron Supabase/pg_cron).
-- ---------------------------------------------------------------------------
create or replace function public.rate_limits_cleanup()
returns void
language sql
security definer
as $$
  delete from public.admin_rate_limits where expires_at < now();
$$;
