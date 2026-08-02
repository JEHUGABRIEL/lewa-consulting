import type { MetadataRoute } from "next";
import { servicesData } from "@/lib/services";
import { allFormations, formationCategories } from "@/lib/formations";
import { posts } from "@/lib/posts";

const BASE_URL = "https://www.lewaconsultingroup.com";
const LOCALES = ["fr", "en"] as const;
const NOW = new Date();

type PageDef = {
  path: string;
  lastModified?: Date;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

/** Génère l'entrée de chaque page pour les deux locales, avec hreflang. */
function localized(defs: PageDef[]): MetadataRoute.Sitemap {
  return defs.flatMap((d) => {
    const path = d.path === "/" ? "" : d.path;
    return LOCALES.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: d.lastModified ?? NOW,
      changeFrequency: d.changeFrequency,
      priority: d.priority,
      alternates: {
        languages: {
          fr: `${BASE_URL}/fr${path}`,
          en: `${BASE_URL}/en${path}`,
          "x-default": `${BASE_URL}/fr${path}`,
        },
      },
    }));
  });
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Pages statiques (les pages catégories de formations sont générées plus bas,
  // depuis formationCategories, pour éviter les doublons)
  const staticPages: PageDef[] = [
    { path: "/", changeFrequency: "monthly", priority: 1 },
    { path: "/services", changeFrequency: "monthly", priority: 0.9 },
    { path: "/actualites", changeFrequency: "weekly", priority: 0.8 },
    { path: "/a-propos", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
    { path: "/mentions-legales", changeFrequency: "yearly", priority: 0.2 },
  ];

  // Pages services dynamiques (6 domaines)
  const servicePages: PageDef[] = servicesData.map((s) => ({
    path: `/services/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Pages formations dynamiques (toutes les formations)
  const formationPages: PageDef[] = allFormations.map((f) => ({
    path: `/formations/${f.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Catégories de formations (routes dérivées des slugs de catégorie)
  const formationCategoryPages: PageDef[] = formationCategories.map((c) => ({
    path: `/formations/${c.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Pages actualités dynamiques
  const postPages: PageDef[] = posts.map((p) => ({
    path: `/actualites/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return localized([
    ...staticPages,
    ...servicePages,
    ...formationCategoryPages,
    ...formationPages,
    ...postPages,
  ]);
}
