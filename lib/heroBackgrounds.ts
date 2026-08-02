/**
 * Arrière-plans pour les hero sections.
 * Chaque page dispose de 3 variantes pour alimenter un slider.
 * Le slider applique déjà un overlay navy (cf. HeroSlider) pour la lisibilité.
 */

export type PageKey = "services" | "formations" | "aPropos" | "contact" | "home";

const QUALITY = "f=auto&q=auto&w=1600";

const backgrounds: Record<PageKey, string[]> = {
  services: [
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/rapport-financier.avif?${QUALITY}`, // analyse financière
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/equipe-kpi.avif?${QUALITY}`,        // équipe / KPI
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/equipe-travail.avif?${QUALITY}`,     // équipe qui travaille
  ],
  formations: [
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-1.jpg?${QUALITY}`, // étudiants
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-2.jpg?${QUALITY}`, // étudiants
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-3.jpg?${QUALITY}`, // étudiants
  ],
  aPropos: [
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/gestionnaire-tablette.avif?${QUALITY}`,  // bureau moderne
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-internationale.avif?${QUALITY}`,  // réunion d'équipe
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/equipe-travail.avif?${QUALITY}`,          // équipe au travail
  ],
  contact: [
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-briefing.jpg?${QUALITY}`,          // briefing
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/presentation-statistiques.avif?${QUALITY}`, // présentation
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-internationale.avif?${QUALITY}`,    // réunion
  ],
  home: [
    `https://res.cloudinary.com/dwmrzp61c/image/upload/images/devanture_cabinet/devanture.png?f=auto&q=auto&w=1600`, // devanture du cabinet
    `https://res.cloudinary.com/dwmrzp61c/image/upload/images/remises_diplomes/remise-3.png?f=auto&q=auto&w=1600`, // remise de diplômes
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-internationale.avif?f=auto&q=auto&w=1600`, // réunion
  ],
};

/** Retourne un tableau de 3 URLs pour le slider hero */
export function getHeroBackgrounds(page: PageKey): string[] {
  return backgrounds[page];
}

/** Retourne uniquement la première URL (rétrocompatibilité) */
export function getHeroBackground(page: PageKey): string {
  return backgrounds[page][0];
}
