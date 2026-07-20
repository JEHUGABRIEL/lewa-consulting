/** Données partagées des services pour les pages individuelles /services/[slug] */

export type ServiceItem = {
  slug: string;
  title: string;
  short: string;
  desc: string;
  icon: string;
  image: string;
  imageAlt: string;
  tags: string[];
  intro: string;
  points: string[];
  details: string[];
  benefits: string[];
  targetDesc: string;
};

export const servicesData: ServiceItem[] = [
  {
    slug: "expertise-comptable",
    title: "Expertise comptable",
    short: "Un accompagnement sur mesure au plus proche de vos enjeux",
    desc: "En tant que cabinet d'expertise comptable, nous promulguons des conseils sur mesure pour garantir une gestion financière fiable, conforme et parfaitement adaptée aux besoins de votre organisation.",
    icon: "compta",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
    imageAlt: "Expertise comptable",
    tags: ["TPE", "PME", "ONG", "Institution"],
    intro: "Une tenue de comptabilité rigoureuse et des déclarations fiscales maîtrisées sont essentielles à la pérennité de toute organisation.",
    points: [
      "Tenue de comptabilité générale et analytique",
      "Déclarations fiscales (TVA, IRPP) et sociales (CNSS)",
      "Accompagnement des ONG sur le référentiel comptable SYCEBNL",
      "Révision et fiabilisation des comptes annuels",
      "Conseil en optimisation fiscale",
    ],
    details: [
      "Notre cabinet met à votre disposition une équipe d'experts-comptables expérimentés pour prendre en charge l'intégralité de votre comptabilité. Nous intervenons aussi bien auprès des entreprises que des organisations non gouvernementales et des institutions publiques.",
      "Nous utilisons des outils modernes de gestion comptable pour garantir la fiabilité et la traçabilité de vos données financières. Chaque mission fait l'objet d'un suivi personnalisé avec des reportings réguliers.",
      "Pour les ONG, nous maîtrisons parfaitement le référentiel SYCEBNL, obligatoire en République Centrafricaine, et vous accompagnons dans la mise en place et la tenue de votre comptabilité.",
    ],
    benefits: [
      "Gain de temps sur la gestion administrative et comptable",
      "Sécurisation de vos obligations fiscales et sociales",
      "Aide à la décision grâce à des reportings clairs",
      "Conformité avec les normes comptables en vigueur en RCA",
    ],
    targetDesc: "Nos services d'expertise comptable s'adressent aux TPE, PME, ONG et institutions publiques basées à Bangui et dans toute la République Centrafricaine.",
  },
  {
    slug: "conseil-aux-entreprises",
    title: "Conseil aux entreprises",
    short: "Des conseils avisés au moment opportun",
    desc: "Nous accompagnons les entreprises dans leurs décisions stratégiques et opérationnelles pour améliorer leur performance et sécuriser leur développement.",
    icon: "conseil",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80",
    imageAlt: "Conseil aux entreprises",
    tags: ["PME", "ONG", "Institution"],
    intro: "Un accompagnement stratégique pour vous aider à prendre les bonnes décisions, au bon moment.",
    points: [
      "Diagnostic financier et analyse de la performance",
      "Accompagnement à la création et au développement d'entreprise",
      "Optimisation des processus et organisation interne",
      "Conseil en gestion et stratégie financière",
      "Accompagnement dans les projets de financement",
    ],
    details: [
      "Notre équipe de consultants expérimentés vous accompagne dans l'analyse de votre situation et l'élaboration de solutions adaptées à vos objectifs. Nous intervenons à chaque étape clé de la vie de votre entreprise.",
      "Que vous soyez en phase de création, de croissance ou de restructuration, nous vous apportons un regard externe et objectif pour éclairer vos décisions et maximiser vos chances de succès.",
      "Nous travaillons en étroite collaboration avec vos équipes pour garantir une mise en œuvre efficace des recommandations et un suivi dans la durée.",
    ],
    benefits: [
      "Vision claire de votre situation financière et stratégique",
      "Prise de décision éclairée grâce à des analyses objectives",
      "Optimisation de votre organisation et de vos processus",
      "Accompagnement personnalisé et suivi dans la durée",
    ],
    targetDesc: "Nos services de conseil s'adressent aux PME, ONG et institutions publiques cherchant à améliorer leur performance et à sécuriser leur développement.",
  },
  {
    slug: "gestion-sociale-rh",
    title: "Gestion sociale et RH",
    short: "Sécurisez la gestion de vos ressources humaines",
    desc: "Nous vous accompagnons dans la gestion administrative de votre personnel et l'optimisation de vos processus RH.",
    icon: "rh",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
    imageAlt: "Gestion sociale et RH",
    tags: ["TPE", "PME", "ONG"],
    intro: "Une gestion sociale maîtrisée est essentielle pour sécuriser vos relations avec vos collaborateurs et éviter les risques juridiques.",
    points: [
      "Gestion de la paie et des déclarations sociales (CNSS)",
      "Établissement des contrats de travail et suivi administratif",
      "Conseil en droit social et gestion des conflits",
      "Mise en place et optimisation des processus RH",
      "Formation en gestion des ressources humaines",
    ],
    details: [
      "Notre cabinet vous accompagne dans l'ensemble de vos obligations sociales et RH. De la paie aux déclarations CNSS, en passant par la gestion des contrats, nous sécurisons l'intégralité de vos processus.",
      "Nous vous aidons également à mettre en place des outils de gestion RH adaptés à la taille de votre organisation, que vous soyez une TPE, une PME ou une ONG.",
      "Notre expertise en droit social centrafricain nous permet de vous conseiller efficacement sur les aspects juridiques liés à la gestion de votre personnel.",
    ],
    benefits: [
      "Sécurisation de la gestion de la paie et des déclarations sociales",
      "Conformité avec le droit social centrafricain",
      "Optimisation des processus RH et gain de productivité",
      "Accompagnement personnalisé selon la taille de votre structure",
    ],
    targetDesc: "Nos services de gestion sociale et RH s'adressent aux TPE, PME et ONG souhaitant sécuriser et optimiser la gestion de leurs ressources humaines.",
  },
  {
    slug: "formation-professionnelle",
    title: "Formation professionnelle",
    short: "Certificat, attestation et CV professionnel à la clé",
    desc: "Des formations pratiques et certifiantes pour développer les compétences de vos équipes et booster votre carrière.",
    icon: "formation",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
    imageAlt: "Formation professionnelle",
    tags: ["TPE", "PME", "ONG", "Institution"],
    intro: "Des modules de formation conçus pour être immédiatement opérationnels, avec un accompagnement personnalisé.",
    points: [
      "Comptabilité, audit et gestion de caisse",
      "Ressources humaines, assistanat de direction et bureautique",
      "Sage Compta, Sage Paie et outils bureautiques",
      "Art oratoire et développement personnel",
      "Sessions adaptées : semaine, soirée ou week-end",
    ],
    details: [
      "Le Cabinet COSI Lewa-Consulting Group propose des formations professionnelles de qualité, animées par des formateurs expérimentés issus du monde de l'entreprise et de l'expertise comptable.",
      "Chaque module est conçu pour être pratique et opérationnel, avec des études de cas réels, des exercices appliqués et un accompagnement personnalisé tout au long de la formation.",
      "À l'issue de la formation, vous recevrez un certificat de participation, une attestation détaillant les compétences acquises, ainsi qu'un CV professionnel valorisant votre nouvelle compétence.",
    ],
    benefits: [
      "Formations pratiques et immédiatement opérationnelles",
      "Certificat, attestation et CV professionnel à la clé",
      "Sessions flexibles (semaine, soirée, week-end)",
      "Paiement possible par tranches hebdomadaires",
    ],
    targetDesc: "Nos formations s'adressent aux étudiants, demandeurs d'emploi et professionnels souhaitant acquérir de nouvelles compétences, ainsi qu'aux entreprises désireuses de former leurs équipes.",
  },
  {
    slug: "gestion-privee",
    title: "Gestion privée",
    short: "Conseils en investissements et prévoyance",
    desc: "Un accompagnement personnalisé pour optimiser votre patrimoine et sécuriser votre avenir financier.",
    icon: "privee",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80",
    imageAlt: "Gestion privée",
    tags: ["Dirigeants", "Particuliers"],
    intro: "Bénéficiez de conseils sur mesure pour gérer, protéger et faire fructifier votre patrimoine.",
    points: [
      "Conseil en investissements et placements financiers",
      "Optimisation et structuration du patrimoine",
      "Préparation à la retraite et prévoyance",
      "Stratégie de transmission et succession",
      "Accompagnement dans les projets d'investissement immobilier",
    ],
    details: [
      "Notre cabinet vous accompagne dans la gestion de votre patrimoine avec une approche personnalisée et des conseils adaptés à votre situation personnelle et professionnelle.",
      "Nous vous aidons à définir une stratégie d'investissement cohérente avec vos objectifs, votre profil de risque et votre horizon de placement.",
      "Que vous soyez dirigeant d'entreprise, professionnel libéral ou particulier, nous mettons notre expertise à votre service pour sécuriser et optimiser votre patrimoine.",
    ],
    benefits: [
      "Stratégie patrimoniale personnalisée",
      "Optimisation fiscale de votre patrimoine",
      "Préparation sereine de votre retraite",
      "Transmission maîtrisée de votre patrimoine",
    ],
    targetDesc: "Nos services de gestion privée s'adressent aux dirigeants d'entreprise et aux particuliers souhaitant optimiser et sécuriser leur patrimoine.",
  },
  {
    slug: "conseil-juridique-fiscal",
    title: "Conseil juridique et fiscal",
    short: "Accompagnement juridique et fiscal personnalisé",
    desc: "Un conseil juridique et fiscal de proximité pour sécuriser vos décisions et anticiper les évolutions réglementaires.",
    icon: "juridique",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
    imageAlt: "Conseil juridique et fiscal",
    tags: ["PME", "ONG"],
    intro: "Anticipez les risques juridiques et fiscaux avec un accompagnement expert adapté à votre activité.",
    points: [
      "Conseil juridique en droit des affaires",
      "Optimisation et sécurisation fiscale",
      "Accompagnement dans les contentieux fiscaux",
      "Rédaction et révision de contrats",
      "Veille réglementaire et conformité",
    ],
    details: [
      "Notre cabinet vous propose un accompagnement juridique et fiscal complet pour sécuriser vos décisions et anticiper les évolutions réglementaires.",
      "Nous vous assistons dans la rédaction et la révision de vos contrats, la gestion de vos contentieux fiscaux et la mise en conformité de votre organisation avec la réglementation en vigueur.",
      "Notre équipe assure une veille réglementaire permanente pour vous informer des changements législatifs et fiscaux qui impactent votre activité.",
    ],
    benefits: [
      "Sécurisation juridique de vos activités",
      "Optimisation de votre situation fiscale",
      "Anticipation des risques et des contentieux",
      "Veille réglementaire personnalisée",
    ],
    targetDesc: "Nos services juridiques et fiscaux s'adressent aux PME, ONG et institutions ayant besoin d'un accompagnement expert pour sécuriser leurs décisions.",
  },
];

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  return servicesData.find((s) => s.slug === slug);
}
