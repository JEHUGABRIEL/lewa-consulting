/**
 * Données structurelles des formations professionnelles.
 * Les textes (nom, note, description, imageAlt) sont traduits
 * via les clés `formations.items.<slug>` dans messages/*.json.
 */

// ---- Helpers ----

/** Convertit un nom de formation en slug URL */
export function slugify(text: string): string {
  return text
    .normalize("NFD")               // décompose les accents (é → e + ◌́)
    .replace(/[\u0300-\u036f]/g, "") // supprime les diacritiques
    .replace(/['()]/g, "")           // supprime apostrophes et parenthèses
    .replace(/[^\w\s-]/g, "")       // garde lettres, chiffres, espaces, tirets
    .replace(/\s+/g, "-")            // espaces → tirets
    .replace(/-+/g, "-")             // évite les doubles tirets
    .toLowerCase()
    .replace(/^-+|-+$/g, "");        // trim les tirets
}

// ---- Types ----

export type Level = "debutant" | "intermediaire" | "avance";

export type FormationRow = {
  slug: string;
  /** Identifiant de la catégorie parente ("compta" | "bureautique") */
  category: string;
  /** Image du cabinet (Cloudinary) */
  image: string;
  price: string;
  level?: Level;
};

export type FeaturedFormation = {
  slug: string;
  /** Image du cabinet (Cloudinary) */
  image: string;
  price: string;
  level?: Level;
};

// ---- Données complètes pour la grille tarifaire ----

export const comptaFinance: FormationRow[] = [
  { slug: "comptabilite-bancaire", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/equipe-kpi.avif", price: "75 000", level: "intermediaire" },
  { slug: "systeme-comptable-des-ong-sycebnl", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/rapport-financier.avif", price: "75 000", level: "intermediaire" },
  { slug: "pratique-en-caissiere-bancaire", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/gestionnaire-tablette.avif", price: "70 000", level: "debutant" },
  { slug: "comptabilite-d-entreprise", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/equipe-kpi.avif", price: "65 000", level: "intermediaire" },
  { slug: "comptabilite-d-entreprise-sur-sage-compta", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/presentation-statistiques.avif", price: "65 000", level: "avance" },
  { slug: "ressources-humaines-sage-paie", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-internationale.avif", price: "65 000", level: "intermediaire" },
  { slug: "mission-d-audit", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/rapport-financier.avif", price: "60 000", level: "avance" },
  { slug: "gestion-de-caisse", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/gestionnaire-tablette.avif", price: "60 000", level: "debutant" },
];

export const bureautiqueDev: FormationRow[] = [
  { slug: "assistante-de-direction", category: "bureautique", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/presentation-statistiques.avif", price: "60 000", level: "intermediaire" },
  { slug: "informatique-bureautique", category: "bureautique", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-1.jpg", price: "35 000", level: "debutant" },
  { slug: "art-oratoire", category: "bureautique", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-2.jpg", price: "30 000", level: "debutant" },
];

// ---- Formations vedettes (extrait pour la page d'accueil) ----

export const featuredFormations: FeaturedFormation[] = [
  { slug: "comptabilite-bancaire", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/rapport-financier.avif", price: "75 000", level: "intermediaire" },
  { slug: "pratique-en-caissiere-bancaire", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/gestionnaire-tablette.avif", price: "70 000", level: "debutant" },
  { slug: "informatique-bureautique", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-1.jpg", price: "35 000", level: "debutant" },
  { slug: "mission-d-audit", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/presentation-statistiques.avif", price: "60 000", level: "avance" },
];

// ---- Concaténation complète ----

export const allFormations: FormationRow[] = [...comptaFinance, ...bureautiqueDev];

// ---- Lookup par slug ----

export function getFormationBySlug(slug: string): FormationRow | undefined {
  return allFormations.find((f) => f.slug === slug);
}

// ---- Regroupement par catégorie pour les pages détails ----

export function getFormationsByCategory(categoryId: string): FormationRow[] {
  return allFormations.filter((f) => f.category === categoryId);
}

// ---- Catégories pour la navigation et les filtres ----
// (le label est traduit via `formations.catComptaTitle` / `formations.catBureautiqueTitle`)

export const formationCategories = [
  { id: "compta", slug: "comptabilite-finance" },
  { id: "bureautique", slug: "bureautique-developpement" },
];
