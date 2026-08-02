import type { MetadataRoute } from "next";
import { servicesData } from "@/lib/services";
import { allFormations, formationCategories } from "@/lib/formations";
import { posts } from "@/lib/posts";

const BASE_URL = "https://www.lewaconsultingroup.com";
const NOW = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  // Pages statiques (les pages catégories de formations sont générées plus bas,
  // depuis formationCategories, pour éviter les doublons)
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: NOW, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/services`, lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/actualites`, lastModified: NOW, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/a-propos`, lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: NOW, changeFrequency: "yearly", priority: 0.6 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: NOW, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Pages services dynamiques (6 domaines)
  const servicePages: MetadataRoute.Sitemap = servicesData.map((s) => ({
    url: `${BASE_URL}/services/${s.slug}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Pages formations dynamiques (toutes les formations)
  const formationPages: MetadataRoute.Sitemap = allFormations.map((f) => ({
    url: `${BASE_URL}/formations/${f.slug}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Catégories de formations (routes dérivées des slugs de catégorie)
  const formationCategoryPages: MetadataRoute.Sitemap = formationCategories.map((c) => ({
    url: `${BASE_URL}/formations/${c.slug}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Pages actualités dynamiques
  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/actualites/${p.slug}`,
    lastModified: NOW,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...servicePages,
    ...formationCategoryPages,
    ...formationPages,
    ...postPages,
  ];
}
