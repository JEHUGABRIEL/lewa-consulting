import type { MetadataRoute } from "next";
import { formationCategories } from "@/lib/formations";
import {
  getPublicFormations,
  getPublicPosts,
  getPublicServices,
} from "@/lib/admin/public";

const BASE_URL = "https://www.lewaconsultingroup.com";
const LOCALES = ["fr", "en"] as const;
const NOW = new Date();

type PageDef = {
  path: string;
  lastModified?: Date;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};


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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, formations, posts] = await Promise.all([
    getPublicServices(),
    getPublicFormations(),
    getPublicPosts(),
  ]);



  const staticPages: PageDef[] = [
    { path: "/", changeFrequency: "monthly", priority: 1 },
    { path: "/services", changeFrequency: "monthly", priority: 0.9 },
    { path: "/formations", changeFrequency: "monthly", priority: 0.9 },
    { path: "/actualites", changeFrequency: "weekly", priority: 0.8 },
    { path: "/a-propos", changeFrequency: "monthly", priority: 0.7 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
    { path: "/mentions-legales", changeFrequency: "yearly", priority: 0.2 },
  ];


  const servicePages: PageDef[] = services.map((s) => ({
    path: `/services/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));


  const formationPages: PageDef[] = formations.map((f) => ({
    path: `/formations/${f.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));


  const formationCategoryPages: PageDef[] = formationCategories.map((c) => ({
    path: `/formations/${c.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));


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
