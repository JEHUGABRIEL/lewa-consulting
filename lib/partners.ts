/** Données des partenaires / organisations qui font confiance au cabinet */

export type Partner = {
  name: string;
  tagline: string;
  initials: string;
  bgFrom: string;
  bgTo: string;
  text: string;
  pattern: string;
  /** Image Unsplash (logo ou illustration de l'organisation) */
  image: string;
  /** Texte alternatif */
  imageAlt: string;
};

export const partners: Partner[] = [
  {
    name: "ONG Espoir & Développement",
    tagline: "Développement communautaire",
    initials: "ED",
    bgFrom: "from-emerald-600",
    bgTo: "to-emerald-800",
    text: "text-emerald-50",
    pattern: "M0 0 L16 0 L32 16 L16 32 Z",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100&q=80",
    imageAlt: "Développement communautaire",
  },
  {
    name: "Ecobank Centrafrique",
    tagline: "Banque panafricaine",
    initials: "EC",
    bgFrom: "from-blue-700",
    bgTo: "to-blue-900",
    text: "text-blue-50",
    pattern: "M0 16 C8 0 24 0 32 16 C24 32 8 32 0 16 Z",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&q=80",
    imageAlt: "Banque et finance",
  },
  {
    name: "Université de Bangui",
    tagline: "Enseignement supérieur",
    initials: "UB",
    bgFrom: "from-amber-600",
    bgTo: "to-amber-800",
    text: "text-amber-50",
    pattern: "M16 0 L32 8 L32 24 L16 32 L0 24 L0 8 Z",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=100&q=80",
    imageAlt: "Université",
  },
  {
    name: "SYCEBNL",
    tagline: "Référentiel comptable ONG",
    initials: "SY",
    bgFrom: "from-violet-600",
    bgTo: "to-violet-800",
    text: "text-violet-50",
    pattern: "M0 0 L16 8 L32 0 L32 24 L16 32 L0 24 Z",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=100&q=80",
    imageAlt: "Documents comptables",
  },
  {
    name: "Ets Lokondo & Fils",
    tagline: "Commerce général",
    initials: "LF",
    bgFrom: "from-rose-600",
    bgTo: "to-rose-800",
    text: "text-rose-50",
    pattern: "M16 0 L32 16 L16 32 L0 16 Z",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=100&q=80",
    imageAlt: "Commerce et entreprise",
  },
  {
    name: "CNSS Centrafrique",
    tagline: "Sécurité sociale",
    initials: "CN",
    bgFrom: "from-sky-600",
    bgTo: "to-sky-800",
    text: "text-sky-50",
    pattern: "M0 0 L32 0 L32 16 L16 32 L0 16 Z",
    image: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=100&q=80",
    imageAlt: "Bâtiment administratif",
  },
];
