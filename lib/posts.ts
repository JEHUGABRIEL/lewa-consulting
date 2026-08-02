/** Articles / actualités du Cabinet COSI Lewa-Consulting Group */

export type PostCategoryKey = "formations" | "audit" | "evenement";

export type Post = {
  slug: string;
  /** Clé de catégorie stable (utilisée pour l'illustration et le filtrage FR/EN) */
  category: PostCategoryKey;
  /** Image associée à l'article */
  image: string;
};

/**
 * Données structurelles des articles.
 * Tous les textes (titre, résumé, date, catégorie, contenu, alt) sont
 * traduits via les fichiers messages/fr.json et messages/en.json,
 * clés `posts.<slug>.*`.
 */
export const posts: Post[] = [
  {
    slug: "session-comptabilite-bancaire-2026",
    category: "formations",
    image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/equipe-kpi.avif",
  },
  {
    slug: "accompagnement-sycebnl-2026",
    category: "audit",
    image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/rapport-financier.avif",
  },
  {
    slug: "atelier-declaration-fiscale-tpe",
    category: "evenement",
    image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-briefing.jpg",
  },
  {
    slug: "certificats-bureautique-2026",
    category: "formations",
    image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-4.jpg",
  },
];
