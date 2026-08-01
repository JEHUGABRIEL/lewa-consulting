/** Données partagées des services pour les pages individuelles /services/[slug] */

export type ServiceItem = {
  slug: string;
  icon: string;
  image: string;
};

export const servicesData: ServiceItem[] = [
  {
    slug: "expertise-comptable",
    icon: "compta",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80",
  },
  {
    slug: "conseil-aux-entreprises",
    icon: "conseil",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80",
  },
  {
    slug: "gestion-sociale-rh",
    icon: "rh",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80",
  },
  {
    slug: "formation-professionnelle",
    icon: "formation",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
  },
  {
    slug: "gestion-privee",
    icon: "privee",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80",
  },
  {
    slug: "conseil-juridique-fiscal",
    icon: "juridique",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
  },
];

export function getServiceBySlug(slug: string): ServiceItem | undefined {
  return servicesData.find((s) => s.slug === slug);
}
