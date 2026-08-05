import { setRequestLocale } from "next-intl/server";
import { isRecentlyAdded } from "@/lib/recent";
import HomePage from "@/components/HomePage";
import {
  getPublicFeaturedFormations,
  getPublicFormations,
  getPublicPartners,
  getPublicPosts,
  getPublicServices,
  getPublicTestimonials,
} from "@/lib/admin/public";










export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [featured, formations, services, posts, partners, testimonials] = await Promise.all([
    getPublicFeaturedFormations(),
    getPublicFormations(),
    getPublicServices(),
    getPublicPosts(),
    getPublicPartners(),
    getPublicTestimonials(locale as "fr" | "en"),
  ]);

  // Badge « Nouveau » : élément ajouté/modifié il y a moins de 7 jours.
  // Calcul côté serveur (pas de Date.now() dans le client) pour un rendu
  // stable entre SSR et hydratation.
  return (
    <HomePage
      featured={featured.map((f) => ({ ...f, isNew: isRecentlyAdded(f.updatedAt) }))}
      formations={formations}
      services={services}
      posts={posts.map((p) => ({ ...p, isNew: isRecentlyAdded(p.updatedAt) }))}
      partners={partners}
      testimonials={testimonials}
    />
  );
}
