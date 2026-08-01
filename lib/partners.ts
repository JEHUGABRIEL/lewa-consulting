/** Données des partenaires / organisations qui font confiance au cabinet */

export type Partner = {
  name: string;
  tagline: string;
  /** Logo local ou image de l'organisation */
  image: string;
  /** Texte alternatif */
  imageAlt: string;
};

export const partners: Partner[] = [
  {
    name: "ONG Espoir & Développement",
    tagline: "Développement communautaire",
    image: "/logo_partenaires/espoir_et_developpement.png",
    imageAlt: "Logo ONG Espoir & Développement",
  },
  {
    name: "Ecobank Centrafrique",
    tagline: "Banque panafricaine",
    image: "/logo_partenaires/ecobank.png",
    imageAlt: "Logo Ecobank Centrafrique",
  },
  {
    name: "Université de Bangui",
    tagline: "Enseignement supérieur",
    image: "/logo_partenaires/universite-bangui.png",
    imageAlt: "Logo Université de Bangui",
  },
  {
    name: "SYCEBNL",
    tagline: "Référentiel comptable ONG",
    image: "/logo_partenaires/SYCEBNL.jpeg",
    imageAlt: "Logo SYCEBNL",
  },
  {
    name: "CNSS Centrafrique",
    tagline: "Sécurité sociale",
    image: "/logo_partenaires/cnss.jpeg",
    imageAlt: "Logo CNSS Centrafrique",
  },
  {
    name: "ONG SOPADI",
    tagline: "Développement & solidarité",
    image: "/logo_partenaires/ong_sopadi.jpeg",
    imageAlt: "Logo ONG SOPADI",
  },
  {
    name: "Afriland First Bank",
    tagline: "Banque panafricaine",
    image: "/logo_partenaires/afrilan_first_bank.png",
    imageAlt: "Logo Afriland First Bank",
  },
  {
    name: "Groupe Rayan",
    tagline: "Commerce & services",
    image: "/logo_partenaires/rayan.png",
    imageAlt: "Logo Groupe Rayan",
  },
  {
    name: "ACF",
    tagline: "Action humanitaire",
    image: "/logo_partenaires/acf.png",
    imageAlt: "Logo ACF",
  },
  {
    name: "ONFP",
    tagline: "Formation professionnelle",
    image: "/logo_partenaires/ONFP.png",
    imageAlt: "Logo ONFP",
  },
  {
    name: "ONG EDA",
    tagline: "Entraide & développement",
    image: "/logo_partenaires/ong_eda.png",
    imageAlt: "Logo ONG EDA",
  },
  {
    name: "Oxfam",
    tagline: "Solidarité internationale",
    image: "/logo_partenaires/oxfam.png",
    imageAlt: "Logo Oxfam",
  },
  {
    name: "ONG SAD Africa",
    tagline: "Développement en Afrique",
    image: "/logo_partenaires/ong_sad_africa.jpeg",
    imageAlt: "Logo ONG SAD Africa",
  },
  {
    name: "PCG",
    tagline: "Partenaire institutionnel",
    image: "/logo_partenaires/pcg.png",
    imageAlt: "Logo PCG",
  },
];
