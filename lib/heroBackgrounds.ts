/**
 * Arrière-plans Unsplash pour les hero sections.
 * Chaque page dispose de 3 variantes pour alimenter un slider.
 * Le slider applique déjà un overlay navy (cf. HeroSlider) pour la lisibilité.
 */

export type PageKey = "services" | "formations" | "aPropos" | "contact" | "home";

const QUALITY = "w=1600&q=80";

const backgrounds: Record<PageKey, string[]> = {
  services: [
    `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?${QUALITY}`, // analyse financière
    `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?${QUALITY}`,   // comptabilité / calculatrice
    `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?${QUALITY}`, // open space bureau
  ],
  formations: [
    `https://images.unsplash.com/photo-1524178232363-1fb2b075b655?${QUALITY}`, // formation / tableau
    `https://images.unsplash.com/photo-1523240795612-9a054b0db644?${QUALITY}`, // étudiants qui apprennent
    `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?${QUALITY}`, // salle de formation
  ],
  aPropos: [
    `https://images.unsplash.com/photo-1497366811353-6870744d04b2?${QUALITY}`, // bureau moderne
    `https://images.unsplash.com/photo-1600880292203-757bb62b4baf?${QUALITY}`, // réunion d'équipe
    `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?${QUALITY}`, // building
  ],
  contact: [
    `https://images.unsplash.com/photo-1497366754035-f200968a6e72?${QUALITY}`, // hall d'entrée
    `https://images.unsplash.com/photo-1423666639041-f56000c27a9a?${QUALITY}`, // téléphone
    `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?${QUALITY}`, // bâtiments ville
  ],
  home: [
    `https://res.cloudinary.com/dwmrzp61c/image/upload/images/devanture_cabinet/devanture.png?f=auto&q=auto&w=1600`, // devanture du cabinet
    `https://res.cloudinary.com/dwmrzp61c/image/upload/images/remises_diplomes/remise-3.png?f=auto&q=auto&w=1600`, // remise de diplômes
    `https://images.unsplash.com/photo-1559136555-9303baea8ebd?${QUALITY}`,   // salle de réunion
  ],
};

/** Retourne un tableau de 3 URLs Unsplash pour le slider hero */
export function getHeroBackgrounds(page: PageKey): string[] {
  return backgrounds[page];
}

/** Retourne uniquement la première URL (rétrocompatibilité) */
export function getHeroBackground(page: PageKey): string {
  return backgrounds[page][0];
}
