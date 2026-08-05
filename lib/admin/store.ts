















import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { comptaFinance, bureautiqueDev } from "@/lib/formations";
import { servicesData } from "@/lib/services";
import { posts } from "@/lib/posts";
import { partners } from "@/lib/partners";
import { testimonials } from "@/lib/testimonials";
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";
import {
  DEFAULT_EMAIL_TEMPLATES,
  type AdminStore,
  type EmailTemplates,
  type FormationItem,
  type ServiceItem,
  type PostItem,
  type PartnerItem,
  type TestimonialItem,
} from "./constants";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "admin-store.json");
const STORE_ROW_ID = "main";


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


type StoreRow = {
  id: string;
  data: AdminStore;
  updated_at: string;
};


const frMessages = fr as unknown as {
  formations?: { items?: Record<string, { name?: string }> };
  services?: { items?: Record<string, { title?: string }> };
  posts?: Record<string, { title?: string }>;
};

function frName(key: string): string {
  return frMessages.formations?.items?.[key]?.name ?? "";
}
function frServiceTitle(key: string): string {
  return frMessages.services?.items?.[key]?.title ?? "";
}
function frPostTitle(key: string): string {
  return frMessages.posts?.[key]?.title ?? "";
}






function flattenMessages(
  obj: unknown,
  prefix = "",
  out: Record<string, string> = {},
): Record<string, string> {
  if (obj === null || typeof obj !== "object") {
    if (typeof obj === "string") out[prefix] = obj;
    return out;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const p = prefix ? `${prefix}.${key}` : key;
    flattenMessages(value, p, out);
  }
  return out;
}


function ensureContent(store: AdminStore): { store: AdminStore; changed: boolean } {
  const changed =
    !store.content?.fr ||
    !store.content?.en ||
    !Array.isArray(store.enrollments) ||
    !store.emailTemplates?.confirmation?.subject ||
    !store.emailTemplates?.confirmation?.body ||
    !store.emailTemplates?.reminder?.subject ||
    !store.emailTemplates?.reminder?.body;
  if (!changed) return { store, changed: false };
  return {
    store: {
      ...store,
      content: {
        fr: store.content?.fr ?? flattenMessages(fr),
        en: store.content?.en ?? flattenMessages(en),
      },
      enrollments: Array.isArray(store.enrollments) ? store.enrollments : [],
      emailTemplates: {
        confirmation: store.emailTemplates?.confirmation?.subject
          ? store.emailTemplates.confirmation
          : DEFAULT_EMAIL_TEMPLATES.confirmation,
        reminder: store.emailTemplates?.reminder?.subject
          ? store.emailTemplates.reminder
          : DEFAULT_EMAIL_TEMPLATES.reminder,
      } satisfies EmailTemplates,
    },
    changed: true,
  };
}


function seedStore(): AdminStore {
  const formations: FormationItem[] = [
    ...comptaFinance,
    ...bureautiqueDev,
  ].map((f) => ({
    slug: f.slug,
    category: f.category,
    image: f.image,
    price: f.price,
    level: f.level,
    name: frName(f.slug) || f.slug,
  }));

  const services: ServiceItem[] = servicesData.map((s) => ({
    slug: s.slug,
    icon: s.icon,
    image: s.image,
    name: frServiceTitle(s.slug) || s.slug,
  }));

  const postsItems: PostItem[] = posts.map((p) => ({
    slug: p.slug,
    category: p.category,
    image: p.image,
    name: frPostTitle(p.slug) || p.slug,
  }));

  const partnersItems: PartnerItem[] = partners.map((p) => ({
    name: p.name,
    tagline: p.tagline,
    image: p.image,
    imageAlt: p.imageAlt,
  }));

  const testimonialsItems: TestimonialItem[] = testimonials.map((t) => ({
    name: t.name,
    image: t.image,
    imageAlt: t.imageAlt,
  }));

  return {
    formations,
    services,
    posts: postsItems,
    partners: partnersItems,
    testimonials: testimonialsItems,
    enrollments: [],
    emailTemplates: DEFAULT_EMAIL_TEMPLATES,
    content: { fr: flattenMessages(fr), en: flattenMessages(en) },
    updatedAt: new Date().toISOString(),
  };
}


function isCompleteStore(value: unknown): value is AdminStore {
  const s = value as AdminStore;
  return Boolean(
    s &&
      Array.isArray(s.formations) &&
      Array.isArray(s.services) &&
      Array.isArray(s.posts) &&
      Array.isArray(s.partners) &&
      Array.isArray(s.testimonials),
  );
}



async function readStoreFromFile(): Promise<AdminStore> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    return JSON.parse(raw) as AdminStore;
  } catch {

    const seeded = seedStore();
    await writeStoreToFile(seeded);
    return seeded;
  }
}

async function writeStoreToFile(store: AdminStore): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}



async function readStoreFromDatabase(): Promise<AdminStore | null> {
  const { data, error } = await getClient()
    .from("admin_store")
    .select("data")
    .eq("id", STORE_ROW_ID)
    .maybeSingle();
  if (error) throw error;
  const row = data as Pick<StoreRow, "data"> | null;
  return row && isCompleteStore(row.data) ? row.data : null;
}

async function writeStoreToDatabase(store: AdminStore): Promise<void> {
  const { error } = await getClient().from("admin_store").upsert(
    {
      id: STORE_ROW_ID,
      data: store,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw error;
}



export async function readStore(): Promise<AdminStore> {

  if (useDatabase) {
    try {
      const stored = await readStoreFromDatabase();
      if (stored) {

        const { store, changed } = ensureContent(stored);
        if (changed) {
          await writeStoreToDatabase(store);
          await writeStoreToFile(store).catch(() => {});
        }
        return store;
      }

      const seeded = seedStore();
      await writeStoreToDatabase(seeded);
      await writeStoreToFile(seeded).catch(() => {});
      return seeded;
    } catch (err) {

      console.error(
        "[admin] readStore (Postgres) indisponible — repli sur le fichier :",
        err,
      );
    }
  }

  const fromFile = await readStoreFromFile();
  const { store, changed } = ensureContent(fromFile);
  if (changed) await writeStoreToFile(store).catch(() => {});
  return store;
}

export async function writeStore(store: AdminStore): Promise<AdminStore> {
  const withTimestamp: AdminStore = {
    ...store,
    updatedAt: new Date().toISOString(),
  };
  if (useDatabase) {
    try {
      await writeStoreToDatabase(withTimestamp);

      await writeStoreToFile(withTimestamp).catch(() => {});
      return withTimestamp;
    } catch (err) {
      console.error(
        "[admin] writeStore (Postgres) indisponible — repli sur le fichier :",
        err,
      );
    }
  }
  await writeStoreToFile(withTimestamp);
  return withTimestamp;
}
