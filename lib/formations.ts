








export function slugify(text: string): string {
  return text
    .normalize("NFD")                
    .replace(/[\u0300-\u036f]/g, "")  
    .replace(/['()]/g, "")            
    .replace(/[^\w\s-]/g, "")        
    .replace(/\s+/g, "-")             
    .replace(/-+/g, "-")              
    .toLowerCase()
    .replace(/^-+|-+$/g, "");         
}



export type Level = "debutant" | "intermediaire" | "avance";

export type FormationRow = {
  slug: string;

  category: string;

  image: string;
  price: string;
  level?: Level;
};

export type FeaturedFormation = {
  slug: string;

  image: string;
  price: string;
  level?: Level;
  updatedAt?: string;
  isNew?: boolean;
};



export const comptaFinance: FormationRow[] = [
  { slug: "comptabilite-bancaire", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/rapport-financier.avif", price: "75 000", level: "intermediaire" },
  { slug: "systeme-comptable-des-ong-sycebnl", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/rapport-financier.avif", price: "75 000", level: "intermediaire" },
  { slug: "pratique-en-caissiere-bancaire", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/gestionnaire-tablette.avif", price: "70 000", level: "debutant" },
  { slug: "comptabilite-d-entreprise", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/equipe-kpi.avif", price: "65 000", level: "intermediaire" },
  { slug: "comptabilite-d-entreprise-sur-sage-compta", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/presentation-statistiques.avif", price: "65 000", level: "avance" },
  { slug: "ressources-humaines-sage-paie", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-internationale.avif", price: "65 000", level: "intermediaire" },
  { slug: "mission-d-audit", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/presentation-statistiques.avif", price: "60 000", level: "avance" },
  { slug: "gestion-de-caisse", category: "compta", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/gestionnaire-tablette.avif", price: "60 000", level: "debutant" },
];

export const bureautiqueDev: FormationRow[] = [
  { slug: "assistante-de-direction", category: "bureautique", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/presentation-statistiques.avif", price: "60 000", level: "intermediaire" },
  { slug: "informatique-bureautique", category: "bureautique", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-1.jpg", price: "35 000", level: "debutant" },
  { slug: "art-oratoire", category: "bureautique", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-2.jpg", price: "30 000", level: "debutant" },
];



export const featuredFormations: FeaturedFormation[] = [
  { slug: "comptabilite-bancaire", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/rapport-financier.avif", price: "75 000", level: "intermediaire" },
  { slug: "pratique-en-caissiere-bancaire", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/gestionnaire-tablette.avif", price: "70 000", level: "debutant" },
  { slug: "informatique-bureautique", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-1.jpg", price: "35 000", level: "debutant" },
  { slug: "mission-d-audit", image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/presentation-statistiques.avif", price: "60 000", level: "avance" },
];



export const allFormations: FormationRow[] = [...comptaFinance, ...bureautiqueDev];



export function getFormationBySlug(slug: string): FormationRow | undefined {
  return allFormations.find((f) => f.slug === slug);
}



export function getFormationsByCategory(categoryId: string): FormationRow[] {
  return allFormations.filter((f) => f.category === categoryId);
}




export const formationCategories = [
  { id: "compta", slug: "comptabilite-finance" },
  { id: "bureautique", slug: "bureautique-developpement" },
];
