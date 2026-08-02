/** Témoignages clients affichés sur la page d'accueil */

export type Testimonial = {
  name: string;
  /** Photo de la personne (dossier public/temoignages) */
  image: string;
  /** Texte alternatif */
  imageAlt: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Marie Kossi",
    image: "/temoignages/marie_kossi.png",
    imageAlt: "Portrait de Marie Kossi",
  },
  {
    name: "Esther Mbounda",
    image: "/temoignages/esther_mbounda.png",
    imageAlt: "Portrait d'Esther Mbounda",
  },
  {
    name: "Jean-Baptiste Lokondo",
    image: "/temoignages/jean_baptiste_lokondo.png",
    imageAlt: "Portrait de Jean-Baptiste Lokondo",
  },
  {
    name: "Pascal Ngakoutou",
    image: "/temoignages/pascal_ngakoutou.png",
    imageAlt: "Portrait de Pascal Ngakoutou",
  },
  {
    name: "Aline Doko",
    image: "/temoignages/aline_doko.png",
    imageAlt: "Portrait d'Aline Doko",
  },
  {
    name: "Serge Gueret",
    image: "/temoignages/serge_gueret.png",
    imageAlt: "Portrait de Serge Gueret",
  },
];
