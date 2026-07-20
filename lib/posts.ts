/** Articles / actualités du Cabinet COSI Lewa-Consulting Group */

export type Post = {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  slug: string;
  /** Texte intégral de l'article, avec des sauts de ligne */
  content: string;
  /** Image Unsplash associée à l'article */
  image: string;
  imageAlt: string;
};

export const posts: Post[] = [
  {
    title: "Lancement de la session de formations intensives en comptabilité bancaire",
    excerpt:
      "Le Cabinet COSI ouvre les inscriptions pour sa nouvelle session de formation en comptabilité bancaire. 20 heures de modules pratiques pour maîtriser la tenue de comptes, les opérations de caisse et la relation clientèle en milieu bancaire.",
    date: "15 Juin 2026",
    category: "Formations",
    slug: "session-comptabilite-bancaire-2026",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80",
    imageAlt: "Formation en comptabilité bancaire",
    content:
      "Le Cabinet COSI Lewa-Consulting Group a le plaisir d'annoncer le lancement de sa nouvelle session de formation intensive en comptabilité bancaire, prévue pour le mois de juillet 2026.\n\n" +
      "Cette formation de 20 heures est conçue pour les professionnels et les étudiants souhaitant acquérir une maîtrise solide de la tenue de comptes bancaires, des opérations de caisse et de la relation clientèle en milieu bancaire.\n\n" +
      "Au programme :\n- Techniques de tenue de comptes courants et d'épargne\n- Gestion des opérations de caisse et de guichet\n- Traitement des chèques, virements et prélèvements\n- Relation clientèle et conseil bancaire\n- Conformité réglementaire et lutte anti-blanchiment\n\n" +
      "Les inscriptions sont ouvertes. Les frais de participation s'élèvent à 75 000 FCFA, payables en deux tranches. Chaque participant recevra un certificat de fin de formation et un CV professionnel.\n\n" +
      "Pour vous inscrire, contactez-nous au +236 72 69 67 00 ou par email à cabinetcosi29@gmail.com. Les places sont limitées.",
  },
  {
    title: "Accompagnement SYCEBNL : le cabinet référencé par de nouvelles ONG",
    excerpt:
      "Deux nouvelles organisations non gouvernementales nous ont confié la tenue de leur comptabilité selon le référentiel SYCEBNL. Une reconnaissance de notre expertise dans le secteur associatif en Centrafrique.",
    date: "02 Juin 2026",
    category: "Audit & Comptabilité",
    slug: "accompagnement-sycebnl-2026",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
    imageAlt: "Accompagnement comptable SYCEBNL",
    content:
      "Le Cabinet COSI Lewa-Consulting Group étend son expertise dans le secteur associatif. Deux nouvelles organisations non gouvernementales internationales nous ont récemment confié la tenue de leur comptabilité selon le référentiel SYCEBNL (Système Comptable des Entités à But Non Lucratif).\n\n" +
      "Cette nouvelle collaboration témoigne de la reconnaissance de notre expertise dans l'accompagnement comptable et financier des ONG en République Centrafricaine. Notre équipe maîtrise parfaitement les spécificités du SYCEBNL, un référentiel adapté aux particularités des organisations à but non lucratif.\n\n" +
      "Nos services incluent :\n- Tenue complète de la comptabilité selon le SYCEBNL\n- Établissement des états financiers annuels\n- Assistance aux audits externes\n- Déclarations fiscales et sociales\n- Conseil en gestion financière et reporting bailleurs\n\n" +
      "Nous accompagnons également les ONG dans la formation de leurs équipes comptables au référentiel SYCEBNL, assurant ainsi une autonomie progressive et une meilleure maîtrise de leurs outils de gestion.",
  },
  {
    title: "Atelier gratuit : les bases de la déclaration fiscale pour les TPE",
    excerpt:
      "Dans le cadre de notre engagement pour le développement économique local, le Cabinet COSI organise un atelier gratuit sur les déclarations fiscales (TVA, IRPP, CNSS) destiné aux très petites entreprises de Bangui.",
    date: "18 Mai 2026",
    category: "Événement",
    slug: "atelier-declaration-fiscale-tpe",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
    imageAlt: "Atelier gratuit sur les déclarations fiscales",
    content:
      "Dans le cadre de notre engagement pour le développement économique local, le Cabinet COSI Lewa-Consulting Group organise un atelier gratuit sur les déclarations fiscales destiné aux très petites entreprises (TPE) de Bangui.\n\n" +
      "Cet atelier pratique abordera les thèmes suivants :\n- La déclaration de la Taxe sur la Valeur Ajoutée (TVA)\n- L'Impôt sur le Revenu des Personnes Physiques (IRPP)\n- Les cotisations à la Caisse Nationale de Sécurité Sociale (CNSS)\n- Les obligations déclaratives courantes des TPE\n- Les échéances fiscales à ne pas manquer\n\n" +
      "L'atelier se déroulera dans nos locaux : Avenue des Martyrs &mdash; SOCATEL, en face du Stade 20 000 Places, Bangui. Une séance de questions-réponses est prévue à l'issue de la présentation.\n\n" +
      "La participation est gratuite, mais l'inscription est obligatoire. Contactez-nous au +236 72 69 67 00 pour réserver votre place. Les places sont limitées à 20 participants.",
  },
  {
    title: "Remise des certificats aux lauréats de la session bureautique",
    excerpt:
      "12 participants ont reçu leur certificat de formation en informatique bureautique. Une promotion engagée et prête pour le marché du travail.",
    date: "05 Mai 2026",
    category: "Formations",
    slug: "certificats-bureautique-2026",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
    imageAlt: "Remise des certificats de formation",
    content:
      "Le Cabinet COSI Lewa-Consulting Group a remis les certificats de fin de formation aux 12 participants de la session d'informatique bureautique, clôturant ainsi un cycle de formation de quatre semaines intensives.\n\n" +
      "Durant cette formation, les participants ont acquis des compétences solides sur les logiciels essentiels du milieu professionnel :\n- Microsoft Word : mise en page, publipostage, documents longs\n- Microsoft Excel : tableaux, formules, graphiques, tableaux croisés dynamiques\n- Microsoft PowerPoint : présentations professionnelles et animées\n- Microsoft Access : bases de données et requêtes\n\n" +
      "Cette promotion 2026 se distingue par la diversité de ses profils : étudiants fraîchement diplômés, professionnels en reconversion et agents administratifs souhaitant renforcer leurs compétences.\n\n" +
      "Félicitations à tous les lauréats ! La prochaine session est prévue pour septembre 2026. Les inscriptions sont d'ores et déjà ouvertes.",
  },
];
