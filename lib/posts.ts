

export type PostCategoryKey = "formations" | "audit" | "evenement";

export type Post = {
  slug: string;

  category: PostCategoryKey;

  image: string;
  updatedAt?: string;
  isNew?: boolean;
};







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
