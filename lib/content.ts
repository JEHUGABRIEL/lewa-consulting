/** Contenus textuels partagés entre les pages */

export type HeroText = {
  title: string;
  lead: string;
};

export const heroTexts: HeroText[] = [
  {
    title: "Votre partenaire audit, comptabilité et formation",
    lead: "Depuis Bangui, le Cabinet COSI Lewa-Consulting Group accompagne les entreprises et les organisations dans la tenue de leurs comptes, leurs obligations fiscales, et prépare étudiants et professionnels au marché de l'emploi.",
  },
  {
    title: "Une expertise comptable à vos côtés",
    lead: "Tenue de comptabilité, déclarations fiscales et sociales, accompagnement SYCEBNL — une gamme complète de services pour les entreprises et les ONG.",
  },
  {
    title: "Un accompagnement sur mesure",
    lead: "Des professionnels du chiffre à votre écoute pour vous conseiller, vous auditer et vous former, à Bangui et dans toute la Centrafrique.",
  },
];

// ---- Qui sommes-nous ----

export const aboutUs = {
  title: "Qui sommes-nous&nbsp;?",
  lead: "Un cabinet centrafricain d'audit, d'expertise comptable et de formation professionnelle.",
  paragraphs: [
    "Fondé par <strong>Marie-Claire Ngbokoli</strong>, le <strong>Cabinet COSI Lewa-Consulting Group</strong> est un cabinet de conseil, d&rsquo;audit et de formation basé à Bangui, en République Centrafricaine. Depuis sa création, le cabinet s&rsquo;est donné pour mission d&rsquo;accompagner les entreprises, les organisations non gouvernementales et les institutions publiques dans la maîtrise de leurs obligations comptables, fiscales et sociales.",
    "Notre équipe est composée de professionnels aguerris, experts-comptables, auditeurs et formateurs, qui mettent leur expérience au service de votre performance. Nous intervenons dans tous les secteurs d&rsquo;activité, du commerce à l&rsquo;humanitaire, en passant par la microfinance et les services publics.",
    "Au-delà de l&rsquo;expertise technique, c&rsquo;est une relation de proximité et de confiance que nous construisons avec chacun de nos clients. Nous croyons en une Centrafrique où chaque organisation a accès à des services comptables et fiscaux de qualité, pour mieux grandir et innover.",
  ],
  stats: [
    { value: "10+", label: "Années d'expérience" },
    { value: "300+", label: "Clients accompagnés" },
    { value: "15+", label: "Experts" },
  ],
};

// ---- Notre mission ----

export const ourMission = {
  title: "Notre mission",
  lead: "Révéler les talents, sécuriser les finances, bâtir l&rsquo;avenir.",
  items: [
    {
      icon: "shield",
      title: "Sécuriser",
      desc: "Mettre à la disposition des entreprises et des ONG une expertise comptable et fiscale fiable pour sécuriser leur gestion financière et leur conformité réglementaire.",
    },
    {
      icon: "trending",
      title: "Accompagner",
      desc: "Être le partenaire de confiance des acteurs économiques centrafricains pour les conseiller, les auditer et les former avec rigueur et dévouement.",
    },
    {
      icon: "users",
      title: "Former",
      desc: "Préparer les étudiants et les professionnels aux métiers de la comptabilité, de la finance et du management à travers des formations pratiques et certifiantes.",
    },
    {
      icon: "globe",
      title: "Rayonner",
      desc: "Contribuer au développement économique de la Centrafrique en promouvant l&rsquo;excellence comptable et financière comme levier de croissance.",
    },
  ],
  values: [
    { label: "Rigueur", color: "bg-navy" },
    { label: "Proximité", color: "bg-gold" },
    { label: "Innovation", color: "bg-red" },
  ],
};
