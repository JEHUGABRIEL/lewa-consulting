





export type PageKey = "services" | "formations" | "aPropos" | "contact" | "home";

const QUALITY = "f=auto&q=auto&w=1600";

const backgrounds: Record<PageKey, string[]> = {
  services: [
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/rapport-financier.avif?${QUALITY}`,  
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/equipe-kpi.avif?${QUALITY}`,         
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/equipe-travail.avif?${QUALITY}`,      
  ],
  formations: [
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-1.jpg?${QUALITY}`,  
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-2.jpg?${QUALITY}`,  
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-3.jpg?${QUALITY}`,  
  ],
  aPropos: [
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/gestionnaire-tablette.avif?${QUALITY}`,   
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-internationale.avif?${QUALITY}`,   
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/equipe-travail.avif?${QUALITY}`,           
  ],
  contact: [
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-briefing.jpg?${QUALITY}`,           
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/presentation-statistiques.avif?${QUALITY}`,  
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-internationale.avif?${QUALITY}`,     
  ],
  home: [
    `https://res.cloudinary.com/dwmrzp61c/image/upload/images/devanture_cabinet/devanture.png?f=auto&q=auto&w=1600`,  
    `https://res.cloudinary.com/dwmrzp61c/image/upload/images/remises_diplomes/remise-3.png?f=auto&q=auto&w=1600`,  
    `https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-internationale.avif?f=auto&q=auto&w=1600`,  
  ],
};


export function getHeroBackgrounds(page: PageKey): string[] {
  return backgrounds[page];
}


export function getHeroBackground(page: PageKey): string {
  return backgrounds[page][0];
}
