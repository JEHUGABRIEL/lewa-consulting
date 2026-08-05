// ---------------------------------------------------------------------------
// Stockage partagé des compteurs de débit et verrouillages brute-force.
//
// Problème résolu : les compteurs fichier JSON (admin-login-attempts.json,
// admin-otp-rate.json) ne persistent pas sur un déploiement serverless (système
// de fichiers en lecture seule hors /tmp) et ne se synchronisent pas entre
// les instances lambda / workers. Résultat en production : la protection
// brute-force est silencieusement inopérante.
//
// Solution : Supabase (PostgreSQL) via trois RPCs atomiques définis dans
// `supabase/migrations/0003_admin_rate_limits.sql`. En l'absence de
// SUPABASE_URL/SUPABASE_SECRET_KEY (dev local sans base), on retombe sur le
// même stockage fichier qu'avant — comportement identique pour le dev.
// ---------------------------------------------------------------------------

import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---- Supabase client (singleton partagé avec users.ts) --------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const useDatabase = Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY);

let _client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(SUPABASE_URL!, SUPABASE_SECRET_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

// ---- Types partagés -------------------------------------------------------

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

// ===========================================================================
// Fenêtre fixe — incrémente et teste (OTP, enroll…)
// ===========================================================================

// ---- Supabase path --------------------------------------------------------

async function dbConsumeFixedWindow(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const { data, error } = await getClient().rpc("rate_limit_consume", {
    p_key: key,
    p_max: max,
    p_window: windowMs,
  });
  if (error) throw error;
  const r = data as { allowed: boolean; remaining: number; retryAfterMs: number };
  return { allowed: r.allowed, remaining: r.remaining, retryAfterMs: r.retryAfterMs };
}

async function dbResetKey(key: string): Promise<void> {
  const { error } = await getClient().rpc("rate_limit_reset", { p_key: key });
  if (error) throw error;
}

// ---- Fichier path (repli dev) ---------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const RATE_FILE = path.join(DATA_DIR, "admin-otp-rate.json");
const PRUNE_THRESHOLD = 500;
const STALE_MS = 24 * 60 * 60 * 1000;

type RateEntry = { count: number; firstAt: number };
type RateMap = Record<string, RateEntry>;

let rateLock: Promise<void> = Promise.resolve();
function withRateLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = rateLock.then(fn, fn);
  rateLock = run.then(() => undefined, () => undefined);
  return run;
}

async function readRateMap(): Promise<RateMap> {
  try {
    const raw = await fs.readFile(RATE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as RateMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function writeRateMap(data: RateMap): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(RATE_FILE, JSON.stringify(data), "utf-8");
}

function fileConsumeFixedWindow(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  return withRateLock(async () => {
    const now = Date.now();
    const data = await readRateMap();

    if (Object.keys(data).length > PRUNE_THRESHOLD) {
      for (const k of Object.keys(data)) {
        if (now - data[k].firstAt > STALE_MS) delete data[k];
      }
    }

    const entry = data[key];
    if (!entry || now - entry.firstAt > windowMs) {
      data[key] = { count: 1, firstAt: now };
      await writeRateMap(data);
      return { allowed: true, remaining: max - 1, retryAfterMs: 0 };
    }
    if (entry.count >= max) {
      return { allowed: false, remaining: 0, retryAfterMs: entry.firstAt + windowMs - now };
    }
    data[key] = { ...entry, count: entry.count + 1 };
    await writeRateMap(data);
    return { allowed: true, remaining: max - entry.count, retryAfterMs: 0 };
  });
}

function fileResetKey(key: string): Promise<void> {
  return withRateLock(async () => {
    const data = await readRateMap();
    if (data[key]) {
      delete data[key];
      await writeRateMap(data);
    }
  });
}

// ---- API publique —fenêtre fixe -------------------------------------------

/**
 * Incrémente le compteur de `key` dans une fenêtre fixe de `windowMs` ms.
 * Retourne `{ allowed: false }` dès que `max` est atteint.
 * Partagé entre toutes les instances (Supabase) ; repli fichier en dev local.
 */
export function consumeFixedWindow(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (useDatabase) {
    return dbConsumeFixedWindow(key, max, windowMs).catch((err) => {
      console.error("[rateStore] consumeFixedWindow (Postgres) → repli fichier :", err);
      return fileConsumeFixedWindow(key, max, windowMs);
    });
  }
  return fileConsumeFixedWindow(key, max, windowMs);
}

/**
 * Réinitialise le compteur d'une clé (ex. après vérification OTP réussie).
 */
export function resetKey(key: string): Promise<void> {
  if (useDatabase) {
    return dbResetKey(key).catch((err) => {
      console.error("[rateStore] resetKey (Postgres) → repli fichier :", err);
      return fileResetKey(key);
    });
  }
  return fileResetKey(key);
}

// ===========================================================================
// Verrouillage brute-force login (compteur avec lockedUntil)
// ===========================================================================

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min

// ---- Supabase path --------------------------------------------------------

async function dbLockRemaining(key: string): Promise<number> {
  const { data, error } = await getClient().rpc("login_lock_remaining_ms", { p_key: key });
  if (error) throw error;
  // PostgREST peut sérialiser un bigint en chaîne → on normalise en nombre.
  return Math.ceil(Number(data ?? 0) / 1000); // secondes
}

async function dbRecordFailure(key: string): Promise<void> {
  const { error } = await getClient().rpc("login_record_failure", {
    p_key: key,
    p_max: MAX_ATTEMPTS,
    p_window: WINDOW_MS,
  });
  if (error) throw error;
}

async function dbClearFailures(key: string): Promise<void> {
  const { error } = await getClient().rpc("rate_limit_reset", { p_key: key });
  if (error) throw error;
}

// ---- Fichier path (repli dev) ---------------------------------------------

const ATTEMPTS_FILE = path.join(DATA_DIR, "admin-login-attempts.json");

type AttemptEntry = { count: number; lastAt: number; lockedUntil: number };
type AttemptsMap = Record<string, AttemptEntry>;

let attemptsLock: Promise<void> = Promise.resolve();
function withAttemptsLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = attemptsLock.then(fn, fn);
  attemptsLock = run.then(() => undefined, () => undefined);
  return run;
}

async function readAttempts(): Promise<AttemptsMap> {
  try {
    return JSON.parse(await fs.readFile(ATTEMPTS_FILE, "utf-8")) as AttemptsMap;
  } catch {
    return {};
  }
}

async function writeAttempts(data: AttemptsMap): Promise<void> {
  await fs.mkdir(path.dirname(ATTEMPTS_FILE), { recursive: true });
  await fs.writeFile(ATTEMPTS_FILE, JSON.stringify(data), "utf-8");
}

function fileLockRemaining(key: string): Promise<number> {
  return withAttemptsLock(async () => {
    const now = Date.now();
    const data = await readAttempts();
    const entry = data[key];
    if (!entry) return 0;
    const remaining = Math.ceil((entry.lockedUntil - now) / 1000);
    if (remaining > 0) return remaining;
    if (now - entry.lastAt > WINDOW_MS) {
      delete data[key];
      await writeAttempts(data);
    }
    return 0;
  });
}

function fileRecordFailure(key: string): Promise<void> {
  return withAttemptsLock(async () => {
    const now = Date.now();
    const data = await readAttempts();
    const entry = data[key];
    let count = 0;
    if (entry && (entry.lockedUntil > now || now - entry.lastAt <= WINDOW_MS)) {
      count = entry.count;
    }
    const next = count + 1;
    data[key] = {
      count: next,
      lastAt: now,
      lockedUntil: next >= MAX_ATTEMPTS ? now + WINDOW_MS : 0,
    };
    await writeAttempts(data);
  });
}

function fileClearFailures(key: string): Promise<void> {
  return withAttemptsLock(async () => {
    const data = await readAttempts();
    delete data[key];
    await writeAttempts(data);
  });
}

// ---- API publique — verrouillage login ------------------------------------

/**
 * Retourne le nombre de secondes restant avant déverrouillage, ou 0.
 */
export function loginLockRemaining(key: string): Promise<number> {
  if (useDatabase) {
    return dbLockRemaining(key).catch((err) => {
      console.error("[rateStore] loginLockRemaining (Postgres) → repli fichier :", err);
      return fileLockRemaining(key);
    });
  }
  return fileLockRemaining(key);
}

/**
 * Enregistre un échec de connexion et verrouille après MAX_ATTEMPTS.
 */
export function loginRecordFailure(key: string): Promise<void> {
  if (useDatabase) {
    return dbRecordFailure(key).catch((err) => {
      console.error("[rateStore] loginRecordFailure (Postgres) → repli fichier :", err);
      return fileRecordFailure(key);
    });
  }
  return fileRecordFailure(key);
}

/**
 * Efface les échecs d'une clé (après connexion réussie).
 */
export function loginClearFailures(key: string): Promise<void> {
  if (useDatabase) {
    return dbClearFailures(key).catch((err) => {
      console.error("[rateStore] loginClearFailures (Postgres) → repli fichier :", err);
      return fileClearFailures(key);
    });
  }
  return fileClearFailures(key);
}
