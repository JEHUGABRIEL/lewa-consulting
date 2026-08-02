/** Données partagées des domaines d'expertise pour les pages individuelles /services/[slug] */

export type ServiceItem = {
  slug: string;
  icon: string;
  image: string;
};

export const servicesData: ServiceItem[] = [
  {
    slug: "audit-et-assurance",
    icon: "audit",
    image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/rapport-financier.avif",
  },
  {
    slug: "expertise-comptable-finance",
    icon: "compta",
    image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/equipe-kpi.avif",
  },
  {
    slug: "conseil-gouvernance-organisationnel",
    icon: "conseil",
    image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-internationale.avif",
  },
  {
    slug: "formation-renforcement-capacites",
    icon: "formation",
    image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/etudiants/etudiants-1.jpg",
  },
  {
    slug: "accompagnement-entreprises",
    icon: "briefcase",
    image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/gestionnaire-tablette.avif",
  },
  {
    slug: "evenements-professionnels",
    icon: "event",
    image: "https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-briefing.jpg",
  },
];

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  return servicesData.find((s) => s.slug === slug);
}

/**
 * Formations liées à chaque domaine d'expertise (slugs de lib/formations.ts).
 * Utilisé sur la page détail /services/[slug] pour proposer des liens internes
 * vers les formations pertinentes.
 */
export const serviceFormations: Record<string, string[]> = {
  "audit-et-assurance": ["mission-d-audit", "comptabilite-d-entreprise"],
  "expertise-comptable-finance": [
    "comptabilite-bancaire",
    "comptabilite-d-entreprise-sur-sage-compta",
    "systeme-comptable-des-ong-sycebnl",
    "gestion-de-caisse",
  ],
  "conseil-gouvernance-organisationnel": [
    "ressources-humaines-sage-paie",
    "assistante-de-direction",
  ],
  "formation-renforcement-capacites": [
    "informatique-bureautique",
    "art-oratoire",
    "assistante-de-direction",
  ],
  "accompagnement-entreprises": [
    "comptabilite-d-entreprise",
    "informatique-bureautique",
    "art-oratoire",
  ],
  "evenements-professionnels": ["art-oratoire", "assistante-de-direction"],
};
