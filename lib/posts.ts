/** Articles / actualités du Cabinet COSI Lewa-Consulting Group */

export type PostCategoryKey = "formations" | "audit" | "evenement";

export type Post = {
  slug: string;
  /** Clé de catégorie stable (utilisée pour l'illustration et le filtrage FR/EN) */
  category: PostCategoryKey;
  /** Image Unsplash associée à l'article */
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
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80",
  },
  {
    slug: "accompagnement-sycebnl-2026",
    category: "audit",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
  },
  {
    slug: "atelier-declaration-fiscale-tpe",
    category: "evenement",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
  },
  {
    slug: "certificats-bureautique-2026",
    category: "formations",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
  },
];
