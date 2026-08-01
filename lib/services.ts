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
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
  },
  {
    slug: "expertise-comptable-finance",
    icon: "compta",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80",
  },
  {
    slug: "conseil-gouvernance-organisationnel",
    icon: "conseil",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
  },
  {
    slug: "formation-renforcement-capacites",
    icon: "formation",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
  },
  {
    slug: "accompagnement-entreprises",
    icon: "briefcase",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80",
  },
  {
    slug: "evenements-professionnels",
    icon: "event",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
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
