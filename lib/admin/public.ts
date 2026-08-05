










import {
  allFormations,
  featuredFormations as libFeaturedFormations,
  type FeaturedFormation,
  type FormationRow,
  type Level,
} from "@/lib/formations";
import { servicesData, type ServiceItem } from "@/lib/services";
import { posts as libPosts, type Post } from "@/lib/posts";
import { partners as libPartners, type Partner } from "@/lib/partners";
import { testimonials as libTestimonials, type Testimonial } from "@/lib/testimonials";
import { readStore } from "./store";
import type { AdminStore } from "./constants";
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";


const STORE_TTL_MS = 5_000;

let cache: { store: AdminStore | null; at: number } | null = null;


export async function getStore(): Promise<AdminStore | null> {
  const now = Date.now();
  if (cache && now - cache.at < STORE_TTL_MS) return cache.store;
  let store: AdminStore | null = null;
  try {
    store = await readStore();
  } catch {
    store = null;
  }
  cache = { store, at: now };
  return store;
}


export function invalidateStoreCache(): void {
  cache = null;
}

// Soft delete : un élément de la corbeille (`deletedAt` posé) n'est jamais
// rendu public. On l'exclut à la fois des items du store et des données
// statiques dont le slug est dans la corbeille.
function isDeleted(item: { deletedAt?: string }): boolean {
  return Boolean(item.deletedAt);
}

function deletedSlugs(items: { slug: string; deletedAt?: string }[]): Set<string> {
  return new Set(items.filter(isDeleted).map((i) => i.slug));
}




export async function getPublicFormations(): Promise<FormationRow[]> {
  const store = await getStore();
  const removed = deletedSlugs(store?.formations ?? []);
  const rows: FormationRow[] = allFormations
    .filter((f) => !removed.has(f.slug))
    .map((f) => ({ ...f }));
  if (!store) return rows;

  const bySlug = new Map(rows.map((f) => [f.slug, f]));
  for (const item of store.formations) {
    if (isDeleted(item)) continue;
    const existing = bySlug.get(item.slug);
    if (existing) {
      if (item.category) existing.category = item.category;
      if (item.image) existing.image = item.image;
      if (item.price) existing.price = item.price;
      if (item.level) existing.level = item.level as Level;
    } else {
      rows.push({
        slug: item.slug,
        category: item.category || "compta",
        image: item.image,
        price: item.price,
        level: (item.level as Level | undefined) || undefined,
      });
    }
  }
  return rows;
}

export async function getPublicFormationBySlug(
  slug: string,
): Promise<FormationRow | undefined> {
  const rows = await getPublicFormations();
  return rows.find((f) => f.slug === slug);
}

export async function getPublicFormationsByCategory(
  categoryId: string,
): Promise<FormationRow[]> {
  const rows = await getPublicFormations();
  return rows.filter((f) => f.category === categoryId);
}


export async function getPublicFeaturedFormations(): Promise<FeaturedFormation[]> {
  const store = await getStore();
  const removed = deletedSlugs(store?.formations ?? []);
  const featured = libFeaturedFormations
    .filter((f) => !removed.has(f.slug))
    .map((f) => ({ ...f }));
  if (!store) return featured;

  const bySlug = new Map(store.formations.filter((f) => !isDeleted(f)).map((f) => [f.slug, f]));


  for (const f of featured) {
    const item = bySlug.get(f.slug);
    if (!item) continue;
    if (item.image) f.image = item.image;
    if (item.price) f.price = item.price;
    if (item.level) f.level = item.level as Level;
    if (item.updatedAt) f.updatedAt = item.updatedAt;
  }




  const touched: { formation: FeaturedFormation; updatedAt: string }[] = [];
  const seen = new Set<string>();
  for (const item of store.formations) {
    if (isDeleted(item)) continue;
    if (!item.updatedAt) continue;
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);

    const existing = featured.find((f) => f.slug === item.slug);
    if (existing) {
      touched.push({ formation: existing, updatedAt: item.updatedAt });
    } else {
      touched.push({
        formation: {
          slug: item.slug,
          image: item.image,
          price: item.price,
          level: (item.level as Level | undefined) || undefined,
          updatedAt: item.updatedAt,
        },
        updatedAt: item.updatedAt,
      });
    }
  }



  touched.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const rest = featured.filter((f) => !seen.has(f.slug));
  return [...touched.map((t) => t.formation), ...rest];
}



export async function getPublicServices(): Promise<ServiceItem[]> {
  const store = await getStore();
  const removed = deletedSlugs(store?.services ?? []);
  const items: ServiceItem[] = servicesData
    .filter((s) => !removed.has(s.slug))
    .map((s) => ({ ...s }));
  if (!store) return items;

  const bySlug = new Map(items.map((s) => [s.slug, s]));
  for (const item of store.services) {
    if (isDeleted(item)) continue;
    const existing = bySlug.get(item.slug);
    if (existing) {
      if (item.icon) existing.icon = item.icon;
      if (item.image) existing.image = item.image;
    } else {
      items.push({
        slug: item.slug,
        icon: item.icon || "conseil",
        image: item.image,
      });
    }
  }
  return items;
}

export async function getPublicServiceBySlug(
  slug: string,
): Promise<ServiceItem | undefined> {
  const items = await getPublicServices();
  return items.find((s) => s.slug === slug);
}



export async function getPublicPosts(): Promise<Post[]> {
  const store = await getStore();
  const removed = deletedSlugs(store?.posts ?? []);
  const items: Post[] = libPosts
    .filter((p) => !removed.has(p.slug))
    .map((p) => ({ ...p }));
  if (!store) return items;

  const bySlug = new Map(items.map((p) => [p.slug, p]));
  const touched = new Map<string, string>();
  for (const item of store.posts) {
    if (isDeleted(item)) continue;
    const existing = bySlug.get(item.slug);
    if (existing) {
      if (item.category) existing.category = item.category as Post["category"];
      if (item.image) existing.image = item.image;
    } else {
      items.push({
        slug: item.slug,
        category: (item.category as Post["category"]) || "formations",
        image: item.image,
      });
    }
    if (item.updatedAt) touched.set(item.slug, item.updatedAt);
  }




  const recent: { post: Post; updatedAt: string }[] = [];
  const seen = new Set<string>();
  for (const post of items) {
    const at = touched.get(post.slug);
    if (!at || seen.has(post.slug)) continue;
    seen.add(post.slug);
    recent.push({ post: { ...post, updatedAt: at }, updatedAt: at });
  }
  recent.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const rest = items.filter((p) => !seen.has(p.slug));
  return [...recent.map((r) => r.post), ...rest];
}

export async function getPublicPostBySlug(
  slug: string,
): Promise<Post | undefined> {
  const items = await getPublicPosts();
  return items.find((p) => p.slug === slug);
}



export async function getPublicPartners(): Promise<Partner[]> {
  const store = await getStore();
  if (!store) return libPartners;
  return store.partners
    .filter((p) => !isDeleted(p))
    .map((p) => ({
      name: p.name,
      tagline: p.tagline,
      image: p.image,
      imageAlt: p.imageAlt,
    }));
}








export type PublicTestimonial = Testimonial & {
  quote: string;
  role: string;
  org: string;
};

type TestimonialDetails = { quote: string; role: string; org: string };


function buildTestimonialIndex(
  locale: "fr" | "en",
): { byName: Map<string, TestimonialDetails>; byImage: Map<string, TestimonialDetails> } {
  const msgs = (locale === "en" ? en : fr) as unknown as {
    testimonials?: Record<string, string>;
  };
  const t = msgs.testimonials ?? {};
  const byName = new Map<string, TestimonialDetails>();
  const byImage = new Map<string, TestimonialDetails>();


  for (let i = 0; i < 50; i++) {
    const name = t[`name${i}`];
    if (!name) continue;
    const details: TestimonialDetails = {
      quote: t[`quote${i}`] ?? "",
      role: t[`role${i}`] ?? "",
      org: t[`org${i}`] ?? "",
    };
    byName.set(name, details);
    const lib = libTestimonials.find((x) => x.name === name);
    if (lib) byImage.set(lib.image, details);
  }
  return { byName, byImage };
}

export async function getPublicTestimonials(
  locale: "fr" | "en",
): Promise<PublicTestimonial[]> {
  const store = await getStore();
  const base: Testimonial[] = store
    ? store.testimonials
        .filter((t) => !isDeleted(t))
        .map((t) => ({
          name: t.name,
          image: t.image,
          imageAlt: t.imageAlt,
        }))
    : libTestimonials;

  const { byName, byImage } = buildTestimonialIndex(locale);
  return base.map((t) => {
    const details =
      byName.get(t.name) ?? (t.image ? byImage.get(t.image) : undefined);
    return {
      ...t,
      quote: details?.quote ?? "",
      role: details?.role ?? "",
      org: details?.org ?? "",
    };
  });
}
