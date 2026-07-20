/** Témoignages clients affichés sur la page d'accueil */

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  org: string;
  initials: string;
  color: string;
  /** Image Unsplash (photo de la personne) */
  image: string;
  /** Texte alternatif */
  imageAlt: string;
};

export const testimonials: Testimonial[] = [
  {
    quote: "Le Cabinet COSI nous accompagne depuis deux ans sur la tenue de notre comptabilité SYCEBNL. Leur rigueur et leur connaissance du référentiel des ONG nous ont permis de passer nos audits sans aucune réserve.",
    name: "Marie Kossi",
    role: "Responsable Administrative et Financière",
    org: "ONG Espoir & Développement",
    initials: "MK",
    color: "bg-navy",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
    imageAlt: "Portrait de Marie Kossi",
  },
  {
    quote: "J'ai suivi la formation en comptabilité bancaire et j'ai été recrutée trois semaines après. Les formateurs sont vraiment à l'écoute et les cas pratiques sont directement applicables en entreprise.",
    name: "Esther Mbounda",
    role: "Caissière bancaire",
    org: "Ecobank Bangui",
    initials: "EM",
    color: "bg-gold",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
    imageAlt: "Portrait d'Esther Mbounda",
  },
  {
    quote: "Une équipe professionnelle qui allie compétence technique et proximité humaine. La mission d'audit de nos comptes a été menée avec sérieux et dans les délais. Je recommande vivement.",
    name: "Jean-Baptiste Lokondo",
    role: "Gérant",
    org: "Ets Lokondo & Fils SARL",
    initials: "JL",
    color: "bg-red",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    imageAlt: "Portrait de Jean-Baptiste Lokondo",
  },
];
