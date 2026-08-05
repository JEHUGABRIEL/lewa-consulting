import {
  createHmac,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export type AdminUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  salt: string;
  passwordHash: string;
  active: boolean;
  createdAt: string;
  invitedBy: string;
};

export type AdminInvite = {
  token: string;
  email: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  otpHash?: string;
  verifyToken?: string;
  otpExpiresAt?: string;
  otpAttempts?: number;
};

export type UsersStore = {
  users: AdminUser[];
  invites: AdminInvite[];
  updatedAt?: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "admin-users.json");
const USERS_ROW_ID = "main";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const useDatabase = Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY);

let client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL!, SUPABASE_SECRET_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

function seedUsers(): UsersStore {
  return { users: [], invites: [] };
}

function isCompleteUsersStore(value: unknown): value is UsersStore {
  const s = value as UsersStore;
  return Boolean(s && Array.isArray(s.users) && Array.isArray(s.invites));
}

async function readUsersFromFile(): Promise<UsersStore> {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as UsersStore;
    return isCompleteUsersStore(parsed) ? parsed : seedUsers();
  } catch {
    const seeded = seedUsers();
    await writeUsersToFile(seeded).catch(() => {});
    return seeded;
  }
}

async function writeUsersToFile(store: UsersStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(store, null, 2), "utf-8");
}

async function readUsersFromDatabase(): Promise<UsersStore | null> {
  const { data, error } = await getClient()
    .from("admin_users")
    .select("data")
    .eq("id", USERS_ROW_ID)
    .maybeSingle();
  if (error) throw error;
  const row = data as { data: UsersStore } | null;
  return row && isCompleteUsersStore(row.data) ? row.data : null;
}

async function writeUsersToDatabase(store: UsersStore): Promise<void> {
  const { error } = await getClient().from("admin_users").upsert(
    {
      id: USERS_ROW_ID,
      data: store,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}

export async function readUsersStore(): Promise<UsersStore> {
  if (useDatabase) {
    try {
      const stored = await readUsersFromDatabase();
      if (stored) return stored;
      const seeded = seedUsers();
      await writeUsersToDatabase(seeded);
      await writeUsersToFile(seeded).catch(() => {});
      return seeded;
    } catch (err) {
      console.error(
        "[admin] readUsersStore (Postgres) indisponible — repli sur le fichier :",
        err,
      );
    }
  }
  return readUsersFromFile();
}

export async function writeUsersStore(store: UsersStore): Promise<UsersStore> {
  const withTimestamp: UsersStore = {
    ...store,
    updatedAt: new Date().toISOString(),
  };
  if (useDatabase) {
    try {
      await writeUsersToDatabase(withTimestamp);
      await writeUsersToFile(withTimestamp).catch(() => {});
      return withTimestamp;
    } catch (err) {
      console.error(
        "[admin] writeUsersStore (Postgres) indisponible — repli sur le fichier :",
        err,
      );
    }
  }
  await writeUsersToFile(withTimestamp);
  return withTimestamp;
}

// ---------------------------------------------------------------------------
// Mots de passe (scrypt — sel aléatoire par utilisateur)
// ---------------------------------------------------------------------------

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return { salt, hash };
}

export function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): boolean {
  try {
    const hash = scryptSync(password, salt, SCRYPT_KEYLEN);
    const expected = Buffer.from(expectedHash, "hex");
    return (
      hash.length === expected.length && timingSafeEqual(hash, expected)
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Invitations & codes OTP
// ---------------------------------------------------------------------------

export function newToken(bytes = 24): string {
  return randomBytes(bytes).toString("hex");
}

export function newOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function otpKey(inviteToken: string): string {
  return createHmac("sha256", "lewa-admin-otp").update(inviteToken).digest("hex");
}

export function hashOtp(otp: string, inviteToken: string): string {
  return createHmac("sha256", otpKey(inviteToken))
    .update(otp)
    .digest("hex");
}

export function otpMatches(
  otp: string,
  inviteToken: string,
  expectedHash: string,
): boolean {
  try {
    const actual = Buffer.from(hashOtp(otp, inviteToken), "hex");
    const expected = Buffer.from(expectedHash, "hex");
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}

export function getPendingInvite(
  store: UsersStore,
  token: string,
): AdminInvite | undefined {
  return store.invites.find((i) => i.token === token);
}
