/** Témoignages clients affichés sur la page d'accueil */

export type Testimonial = {
  name: string;
  /** Image Unsplash (photo de la personne) */
  image: string;
  /** Texte alternatif */
  imageAlt: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Marie Kossi",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
    imageAlt: "Portrait de Marie Kossi",
  },
  {
    name: "Esther Mbounda",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
    imageAlt: "Portrait d'Esther Mbounda",
  },
  {
    name: "Jean-Baptiste Lokondo",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    imageAlt: "Portrait de Jean-Baptiste Lokondo",
  },
  {
    name: "Pascal Ngakoutou",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    imageAlt: "Portrait de Pascal Ngakoutou",
  },
  {
    name: "Aline Doko",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    imageAlt: "Portrait d'Aline Doko",
  },
  {
    name: "Serge Gueret",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    imageAlt: "Portrait de Serge Gueret",
  },
];
