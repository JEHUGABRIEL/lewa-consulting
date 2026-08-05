import { getRequestConfig } from "next-intl/server";
import { servicesData } from "@/lib/services";
import { featuredFormations } from "@/lib/formations";
import { getStore } from "@/lib/admin/public";
import { sanitizeHtml } from "@/lib/admin/sanitizeHtml";
import {
  CONTENT_LABEL_KEY_RE,
  type AdminStore,
} from "@/lib/admin/constants";
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";


const messagesByLocale: Record<string, typeof fr> = { fr, en };






const SERVICE_ITEM_FIELDS = [
  "title",
  "short",
  "desc",
  "imageAlt",
  "tags",
  "details",
  "points",
];


const reportedLocales = new Set<string>();














function assertServiceItemsResolve(messages: unknown, locale: string) {
  const items = (messages as {
    services?: { items?: Record<string, Record<string, string>> };
  })?.services?.items;

  const missing: string[] = [];
  for (const s of servicesData) {
    for (const field of SERVICE_ITEM_FIELDS) {
      const value = items?.[s.slug]?.[field];
      if (typeof value !== "string" || value.trim() === "") {
        missing.push(`services.items.${s.slug}.${field}`);
      }
    }
  }

  if (missing.length > 0) {
    const sample =
      missing.slice(0, 4).join(", ") + (missing.length > 4 ? "…" : "");
    const message =
      `[i18n] ${missing.length} clé(s) services.items.* introuvable(s) ou vide(s) ` +
      `pour la locale « ${locale} » : ${sample}. Les messages chargés semblent ` +
      `périmés ou incomplets — arrêtez le serveur et relancez « npm run dev », ` +
      `ou purgez le dossier .next (rm -rf .next), puis vérifiez ` +
      `messages/fr.json et messages/en.json.`;
    if (process.env.NODE_ENV === "development") {
      throw new Error(message);
    }


    if (!reportedLocales.has(locale)) {
      reportedLocales.add(locale);
      console.error(message);
    }
  }
}



type Nested = Record<string, unknown>;


function postCategoryLabel(category: string, locale: string): string {
  if (category === "audit") return "Audit";
  if (category === "evenement")
    return locale === "en" ? "Event" : "Événement";
  return locale === "en" ? "Training" : "Formations";
}






// Segments interdits : empêchent qu'une clé de contenu admin (non validée)
// n'atteigne la chaîne de prototypes (pollution de prototype).
const FORBIDDEN_KEY_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);

function setNestedContent(root: Nested, path: string, value: string): void {
  const parts = path.split(".");
  if (parts.some((p) => FORBIDDEN_KEY_SEGMENTS.has(p))) return;
  let node = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const existing = node[part];
    if (existing && typeof existing === "object" && !Array.isArray(existing)) {
      node[part] = { ...(existing as Nested) };
    } else {
      node[part] = {};
    }
    node = node[part] as Nested;
  }
  node[parts[parts.length - 1]] = value;
}















const frReference = fr as unknown as {
  formations?: { items?: Record<string, { name?: string }> };
  services?: { items?: Record<string, { title?: string }> };
  posts?: Record<string, { title?: string }>;
};

function frFormationName(slug: string): string {
  return frReference.formations?.items?.[slug]?.name ?? "";
}

function frServiceTitle(slug: string): string {
  return frReference.services?.items?.[slug]?.title ?? "";
}

function frPostTitle(slug: string): string {
  return frReference.posts?.[slug]?.title ?? "";
}












function mergeStoreMessages(messages: Nested, store: AdminStore, locale: string): Nested {
  const next: Nested = { ...messages };


  const formations = { ...((next.formations as Nested) ?? {}) };
  const formItems = { ...((formations.items as Nested) ?? {}) };
  for (const item of store.formations) {
    const existing = formItems[item.slug] as Nested | undefined;
    if (existing) {



      if (item.name && item.name !== frFormationName(item.slug)) {
        formItems[item.slug] = { ...existing, name: item.name };
      }
    } else if (item.name) {
      formItems[item.slug] = {
        name: item.name,
        note: "",
        desc: item.name,
        imageAlt: item.name,
      };
    }
  }
  formations.items = formItems;
  next.formations = formations;


  for (let i = 0; i < featuredFormations.length; i++) {
    const slug = featuredFormations[i].slug;
    const item = store.formations.find((f) => f.slug === slug);
    if (item?.name && item.name !== frFormationName(item.slug)) {
      (formations as Nested)[`featured${i + 1}Name`] = item.name;
    }
  }


  const services = { ...((next.services as Nested) ?? {}) };
  const servItems = { ...((services.items as Nested) ?? {}) };
  for (const item of store.services) {
    const existing = servItems[item.slug] as Nested | undefined;
    if (existing) {
      if (item.name && item.name !== frServiceTitle(item.slug)) {
        servItems[item.slug] = { ...existing, title: item.name };
      }
    } else if (item.name) {
      servItems[item.slug] = {
        title: item.name,
        short: item.name,
        desc: item.name,
        imageAlt: item.name,
        tags: "",
        details: item.name,
        points: "",
      };
    }
  }
  services.items = servItems;
  next.services = services;


  const posts = { ...((next.posts as Nested) ?? {}) };
  for (const item of store.posts) {
    const existing = posts[item.slug] as Nested | undefined;
    if (existing) {
      if (item.name && item.name !== frPostTitle(item.slug)) {
        posts[item.slug] = { ...existing, title: item.name };
      }
    } else if (item.name) {
      posts[item.slug] = {
        title: item.name,
        excerpt: item.name,
        date: "",
        category: postCategoryLabel(item.category, locale),
        imageAlt: item.name,
        content: item.name,
      };
    }
  }
  next.posts = posts;







  const content = (
    store as {
      content?: { fr?: Record<string, string>; en?: Record<string, string> };
    }
  ).content?.[locale as "fr" | "en"];
  if (content) {
    for (const [key, value] of Object.entries(content)) {
      if (!CONTENT_LABEL_KEY_RE.test(key)) {
        // Le contenu admin peut être rendu via `dangerouslySetInnerHTML` sur le
        // site public : on l'assainit systématiquement (liste blanche de balises)
        // pour empêcher tout XSS stocké, tout en préservant la mise en forme
        // légitime (<strong>, <a href>, <br>…).
        setNestedContent(next, key, sanitizeHtml(value));
      }
    }
  }

  return next;
}

export default getRequestConfig(async ({ requestLocale }) => {


  let locale = (await requestLocale) as string | undefined;
  if (!locale || !messagesByLocale[locale]) {
    locale = "fr";
  }

  const messages = messagesByLocale[locale] ?? fr;

  assertServiceItemsResolve(messages, locale);


  const store = await getStore();
  const merged = store
    ? mergeStoreMessages(messages as Nested, store, locale)
    : messages;

  return {
    locale,
    messages: merged as typeof fr,
  };
});
