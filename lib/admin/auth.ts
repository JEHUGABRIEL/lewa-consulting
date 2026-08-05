












import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { readUsersStore, verifyPassword } from "./users";
import {
  loginClearFailures,
  loginLockRemaining as storeLoginLockRemaining,
  loginRecordFailure,
} from "./rateStore";

export const SESSION_COOKIE = "lewa_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;  










function requireEnv(name: string): string {
  const value = process.env[name];
  if (value) return value;
  throw new Error(
    `[admin] ${name} est requis. Définissez-le dans l'environnement ou .env.local (voir .env.example).`,
  );
}

function envUsername(): string {
  return requireEnv("ADMIN_USERNAME");
}

function envPassword(): string {
  return requireEnv("ADMIN_PASSWORD");
}

function envSecret(): string {
  return requireEnv("ADMIN_SESSION_SECRET");
}



function signRaw(payload: string): Buffer {
  return createHmac("sha256", envSecret()).update(payload).digest();
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}


export function createSessionToken(user: string): string {
  const payload = b64url(
    JSON.stringify({ user, iat: Date.now(), exp: Date.now() + SESSION_TTL_SECONDS * 1000 }),
  );
  return `${payload}.${signRaw(payload).toString("base64url")}`;
}


export function verifySessionToken(token: string): { user: string } | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = signRaw(payload);
    const provided = Buffer.from(sig, "base64url");
    if (provided.length !== expected.length || !timingSafeEqual(expected, provided)) {
      return null;
    }
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as {
      user?: unknown;
      exp?: unknown;
    };
    if (typeof data.user !== "string") return null;
    if (typeof data.exp !== "number" || Date.now() > data.exp) return null;
    return { user: data.user };
  } catch {
    return null;
  }
}



export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}


export function getSessionFromRequest(req: NextRequest): { user: string } | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}






export async function getSessionFromCookies(): Promise<{ user: string } | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// ---------------------------------------------------------------------------
// Sessions actives : en plus de la signature du token, vérifie que le compte
// existe toujours et est actif — permet de révoquer immédiatement l'accès d'un
// utilisateur désactivé ou supprimé (au lieu d'attendre l'expiration du
// cookie de 7 jours). Le compte principal (ADMIN_USERNAME) reste toujours
// autorisé.
// ---------------------------------------------------------------------------

async function sessionUserStillAllowed(username: string): Promise<boolean> {
  const envUser = process.env.ADMIN_USERNAME;
  if (envUser && envUser.trim().toLowerCase() === username.toLowerCase()) {
    return true;
  }
  try {
    const store = await readUsersStore();
    const user = store.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
    return Boolean(user && user.active);
  } catch (err) {
    console.error(
      "[admin] vérification du statut du compte impossible — accès refusé :",
      err,
    );
    return false;
  }
}

export async function getActiveSessionFromRequest(
  req: NextRequest,
): Promise<{ user: string } | null> {
  const session = getSessionFromRequest(req);
  if (!session) return null;
  return (await sessionUserStillAllowed(session.user)) ? session : null;
}

export async function getActiveSessionFromCookies(): Promise<{ user: string } | null> {
  const session = await getSessionFromCookies();
  if (!session) return null;
  return (await sessionUserStillAllowed(session.user)) ? session : null;
}



function sha256Hex(input: string): Buffer {
  return createHmac("sha256", "lewa-admin-credential-check").update(input).digest();
}

export function verifyCredentials(username: string, password: string): boolean {
  const userOk =
    timingSafeEqual(sha256Hex(username), sha256Hex(envUsername()));
  const passOk =
    timingSafeEqual(sha256Hex(password), sha256Hex(envPassword()));
  return userOk && passOk;
}









export async function verifyAnyCredentials(
  username: string,
  password: string,
): Promise<boolean> {


  try {
    if (verifyCredentials(username, password)) return true;
  } catch {

  }

  try {
    const store = await readUsersStore();
    const user = store.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.active,
    );
    if (!user) return false;
    return verifyPassword(password, user.salt, user.passwordHash);
  } catch (err) {
    console.error("[admin] vérification utilisateurs impossible :", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Protection brute-force du login.
//
// Les compteurs sont partagés via Supabase (voir rateStore.ts) afin de
// persister et se synchroniser entre instances serverless — un stockage
// purement fichier serait réinitialisé à chaque invocation lambda et rendrait
// le verrouillage inopérant en production. `clientKey()` reste la dérivation
// de la clé par IP ; le login combine IP + nom d'utilisateur (login/route.ts).
// ---------------------------------------------------------------------------

export function clientKey(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Secondes restant avant déverrouillage (0 si non verrouillé).
export function loginLockRemaining(key: string): Promise<number> {
  return storeLoginLockRemaining(key);
}

export function recordLoginFailure(key: string): Promise<void> {
  return loginRecordFailure(key);
}

export function clearLoginFailures(key: string): Promise<void> {
  return loginClearFailures(key);
}
