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
  /** Image Unsplash */
  image: string;
  price: string;
  level?: Level;
};

export type FeaturedFormation = {
  slug: string;
  /** Image Unsplash */
  image: string;
  price: string;
  level?: Level;
};

// ---- Données complètes pour la grille tarifaire ----

export const comptaFinance: FormationRow[] = [
  { slug: "comptabilite-bancaire", category: "compta", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80", price: "75 000", level: "intermediaire" },
  { slug: "systeme-comptable-des-ong-sycebnl", category: "compta", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80", price: "75 000", level: "intermediaire" },
  { slug: "pratique-en-caissiere-bancaire", category: "compta", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80", price: "70 000", level: "debutant" },
  { slug: "comptabilite-d-entreprise", category: "compta", image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=80", price: "65 000", level: "intermediaire" },
  { slug: "comptabilite-d-entreprise-sur-sage-compta", category: "compta", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80", price: "65 000", level: "avance" },
  { slug: "ressources-humaines-sage-paie", category: "compta", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80", price: "65 000", level: "intermediaire" },
  { slug: "mission-d-audit", category: "compta", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80", price: "60 000", level: "avance" },
  { slug: "gestion-de-caisse", category: "compta", image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80", price: "60 000", level: "debutant" },
];

export const bureautiqueDev: FormationRow[] = [
  { slug: "assistante-de-direction", category: "bureautique", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80", price: "60 000", level: "intermediaire" },
  { slug: "informatique-bureautique", category: "bureautique", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", price: "35 000", level: "debutant" },
  { slug: "art-oratoire", category: "bureautique", image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80", price: "30 000", level: "debutant" },
];

// ---- Formations vedettes (extrait pour la page d'accueil) ----

export const featuredFormations: FeaturedFormation[] = [
  { slug: "comptabilite-bancaire", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80", price: "75 000", level: "intermediaire" },
  { slug: "pratique-en-caissiere-bancaire", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80", price: "70 000", level: "debutant" },
  { slug: "informatique-bureautique", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", price: "35 000", level: "debutant" },
  { slug: "mission-d-audit", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80", price: "60 000", level: "avance" },
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
