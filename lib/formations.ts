/**
 * Données partagées des formations professionnelles.
 * Utilisées à la fois par la page /formations (grille tarifaire),
 * par la page d'accueil (formations vedettes),
 * et par les pages individuelles /formations/[slug].
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
  name: string;
  slug: string;
  note?: string;
  price: string;
  level?: Level;
  /** Identifiant de la catégorie parente ("compta" | "bureautique") */
  category: string;
  /** Image Unsplash */
  image: string;
  /** Texte alternatif */
  imageAlt: string;
};

export type FeaturedFormation = {
  name: string;
  slug: string;
  desc: string;
  price: string;
  level?: Level;
  /** Image Unsplash */
  image: string;
  /** Texte alternatif */
  imageAlt: string;
};

// ---- Données complètes pour la grille tarifaire ----

export const comptaFinance: FormationRow[] = [
  { name: "Comptabilité bancaire", slug: "comptabilite-bancaire", note: "20 heures, payable en 2 tranches", price: "75 000", level: "intermediaire", category: "compta", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80", imageAlt: "Bureau de comptabilité avec documents financiers" },
  { name: "Système comptable des ONG (SYCEBNL)", slug: "systeme-comptable-des-ong-sycebnl", note: "payable en 2 tranches", price: "75 000", level: "intermediaire", category: "compta", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80", imageAlt: "Documents comptables sur un bureau" },
  { name: "Pratique en caissier(e) bancaire", slug: "pratique-en-caissiere-bancaire", price: "70 000", level: "debutant", category: "compta", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80", imageAlt: "Caissière enregistrant une transaction" },
  { name: "Comptabilité d'entreprise", slug: "comptabilite-d-entreprise", price: "65 000", level: "intermediaire", category: "compta", image: "https://images.unsplash.com/photo-1554224154-26032dfc0dbe?w=600&q=80", imageAlt: "Calculatrice et documents comptables" },
  { name: "Comptabilité d'entreprise sur Sage Compta", slug: "comptabilite-d-entreprise-sur-sage-compta", note: "payable par tranches", price: "65 000", level: "avance", category: "compta", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80", imageAlt: "Ordinateur portable avec graphiques financiers" },
  { name: "Ressources humaines (Sage Paie)", slug: "ressources-humaines-sage-paie", price: "65 000", level: "intermediaire", category: "compta", image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80", imageAlt: "Réunion d'équipe en ressources humaines" },
  { name: "Mission d'audit", slug: "mission-d-audit", price: "60 000", level: "avance", category: "compta", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80", imageAlt: "Rapport d'audit sur un bureau" },
  { name: "Gestion de caisse", slug: "gestion-de-caisse", price: "60 000", level: "debutant", category: "compta", image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80", imageAlt: "Caisse enregistreuse" },
];

export const bureautiqueDev: FormationRow[] = [
  { name: "Assistant(e) de direction", slug: "assistante-de-direction", price: "60 000", level: "intermediaire", category: "bureautique", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80", imageAlt: "Assistante de direction au bureau" },
  { name: "Informatique bureautique", slug: "informatique-bureautique", note: "Word, Excel, PowerPoint, Access", price: "35 000", level: "debutant", category: "bureautique", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", imageAlt: "Ordinateur avec outils bureautiques" },
  { name: "Art oratoire", slug: "art-oratoire", price: "30 000", level: "debutant", category: "bureautique", image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&q=80", imageAlt: "Personne s'exprimant en public" },
];

// ---- Formations vedettes (extrait pour la page d'accueil) ----

export const featuredFormations: FeaturedFormation[] = [
  {
    name: "Comptabilité bancaire",
    slug: "comptabilite-bancaire",
    desc: "20 heures de formation pratique pour maîtriser la tenue de comptes bancaires et les opérations financières courantes.",
    price: "75 000",
    level: "intermediaire",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
    imageAlt: "Bureau de comptabilité avec documents financiers",
  },
  {
    name: "Pratique en caissier(e) bancaire",
    slug: "pratique-en-caissiere-bancaire",
    desc: "Formation opérationnelle aux opérations de caisse, encaissement et relation clientèle en milieu bancaire.",
    price: "70 000",
    level: "debutant",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80",
    imageAlt: "Caissière enregistrant une transaction",
  },
  {
    name: "Informatique bureautique",
    slug: "informatique-bureautique",
    desc: "Word, Excel, PowerPoint, Access — les outils essentiels pour être opérationnel en entreprise.",
    price: "35 000",
    level: "debutant",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
    imageAlt: "Ordinateur avec outils bureautiques",
  },
  {
    name: "Mission d'audit",
    slug: "mission-d-audit",
    desc: "Initiation pratique aux techniques d'audit comptable et financier, avec études de cas réels.",
    price: "60 000",
    level: "avance",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80",
    imageAlt: "Rapport d'audit sur un bureau",
  },
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

export const formationCategories = [
  { id: "compta", label: "Comptabilité & finance", slug: "comptabilite-finance" },
  { id: "bureautique", label: "Bureautique & développement pro.", slug: "bureautique-developpement" },
];
