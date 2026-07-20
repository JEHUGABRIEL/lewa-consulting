import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import LevelBadge from "@/components/LevelBadge";
import Mark from "@/components/Mark";
import HeroSlider from "@/components/HeroSlider";
import BlurImage from "@/components/BlurImage";
import CTASection from "@/components/CTASection";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import {
  getFormationBySlug,
  getFormationsByCategory,
  allFormations,
  slugify,
  formationCategories,
} from "@/lib/formations";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return allFormations.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const formation = getFormationBySlug(slug);
  if (!formation) return { title: "Formation introuvable" };
  return { title: formation.name };
}

export default async function FormationDetailPage({ params }: Props) {
  const { slug } = await params;
  const formation = getFormationBySlug(slug);
  if (!formation) notFound();

  // Formations liées (même catégorie, sauf celle-ci)
  const categoryLabel =
    formationCategories.find((c) => c.id === formation.category)?.label ?? "";
  const categorySlug =
    formationCategories.find((c) => c.id === formation.category)?.slug ?? "";

  const related = getFormationsByCategory(formation.category).filter(
    (f) => f.slug !== formation.slug,
  ).slice(0, 2);

  // Helper pour le titre de la page d'en-tête
  const levelLabel =
    formation.level === "debutant"
      ? "Débutant"
      : formation.level === "intermediaire"
        ? "Intermédiaire"
        : formation.level === "avance"
          ? "Avancé"
          : null;

  const heroBgs = getHeroBackgrounds("formations");

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-navy-deep">
        {/* Top accent bar */}
        <div className="relative z-20 h-[3px] w-full bg-gradient-to-r from-gold-bright via-red to-navy" />

        <HeroSlider slides={heroBgs} interval={5000} />

        {/* Décor géométrique */}
        <div className="pointer-events-none absolute -right-20 -top-16 z-10 select-none text-white/[0.06]" aria-hidden="true">
          <Mark className="h-48 w-48" />
        </div>

        <Container className="relative z-10 py-24 sm:py-[7.5rem]">
          <Reveal as="div">
            {/* Back link */}
            <Link
              href={`/formations/${categorySlug}`}
              className="group mb-6 inline-flex items-center gap-1.5 text-sm text-white/60 transition hover:text-white"
            >
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Retour aux formations</span>
            </Link>
          </Reveal>

          <Reveal as="div" delay={100}>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-block h-1.5 w-10 rounded-full bg-gradient-to-r from-gold to-gold-bright" />
                  {formation.level && <LevelBadge level={formation.level} />}
                </div>

                <h1 className="font-display text-3xl leading-tight text-white sm:text-4xl">
                  {formation.name}
                </h1>

                {formation.note && (
                  <p className="mt-3 text-sm leading-relaxed text-white/70">
                    {formation.note}
                  </p>
                )}
              </div>

            </div>

            {/* Level description */}
            {formation.level && (
              <div className="mt-8 flex items-start gap-3 rounded-lg bg-white/10 backdrop-blur-sm p-5 text-sm leading-relaxed text-white/80">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white">
                  i
                </span>
                <div>
                  <p>
                    <strong className="text-white">Niveau {levelLabel}.</strong>{" "}
                    {formation.level === "debutant"
                      ? "Aucun prérequis nécessaire. Cette formation est accessible à tous, quel que soit votre parcours."
                      : formation.level === "intermediaire"
                        ? "Une connaissance de base dans le domaine est recommandée pour tirer le meilleur parti de cette formation."
                        : "Cette formation nécessite des connaissances solides en comptabilité ou dans le domaine concerné. Elle est destinée aux professionnels souhaitant se spécialiser."}
                  </p>
                </div>
              </div>
            )}
          </Reveal>
        </Container>
      </section>

      {/* Contenu principal */}
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Colonne principale */}
          <div>
            <Reveal as="div">
              <h2 className="font-display text-xl text-navy">
                À propos de cette formation
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/75">
                <p>
                  Le <strong>Cabinet COSI Lewa-Consulting Group</strong> propose
                  des formations professionnelles de qualité, animées par des
                  formateurs expérimentés issus du monde de l&rsquo;entreprise et
                  de l&rsquo;expertise comptable.
                </p>
                <p>
                  Chaque module est conçu pour être <strong>pratique et
                  opérationnel</strong>, avec des études de cas réels, des
                  exercices appliqués et un accompagnement personnalisé tout au
                  long de la formation.
                </p>
                <p>
                  À l&rsquo;issue de la formation, vous recevrez un{" "}
                  <strong>certificat de participation</strong>, une{" "}
                  <strong>attestation</strong> détaillant les compétences
                  acquises, ainsi qu&rsquo;un <strong>CV professionnel</strong>{" "}
                  valorisant votre nouvelle compétence.
                </p>
              </div>
            </Reveal>

            <Reveal as="div" delay={100}>
              <div className="mt-8 flex items-start gap-3 rounded-lg border border-border p-5 text-sm">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-gold"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <div>
                  <p className="font-medium text-navy">
                    Formation flexible
                  </p>
                  <p className="mt-1 text-muted leading-relaxed">
                    Sessions disponibles en semaine, en soirée ou le week-end.
                    Paiement possible par tranches hebdomadaires. Contactez-nous
                    pour discuter de vos disponibilités.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Sidebar — Formations liées */}
          <Reveal as="div" delay={150}>
            <div className="sticky top-28 space-y-4">
              {related.length > 0 && (
                <>
                  {/* Titre avec séparateurs dorés */}
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                    <span className="inline-block h-px flex-1 bg-gold/30" />
                    <span>Autres formations en <span className="lowercase">{categoryLabel}</span></span>
                    <span className="inline-block h-px flex-1 bg-gold/30" />
                  </div>

                  {/* Cartes */}
                  <div className="space-y-4">
                    {related.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/formations/${r.slug}`}
                        className="group block"
                      >
                        <div className="overflow-hidden rounded-xl border border-border bg-white transition-all duration-200 hover:border-navy/20 hover:shadow-sm">
                          {/* Image */}
                          <div className="relative h-24 w-full overflow-hidden">
                            <BlurImage
                              src={r.image}
                              alt={r.imageAlt}
                              className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                          </div>
                          {/* Contenu */}
                          <div className="p-3.5">
                            <div className="flex items-center gap-2">
                              {r.level && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-navy/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-navy">
                                  {r.level === "debutant" && <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />}
                                  {r.level === "intermediaire" && <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-500" />}
                                  {r.level === "avance" && <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />}
                                  {r.level === "debutant" ? "Débutant" : r.level === "intermediaire" ? "Intermédiaire" : "Avancé"}
                                </span>
                              )}
                              <span className="font-mono text-[9px] text-muted/60 tabular">
                                {r.price} FCFA
                              </span>
                            </div>
                            <p className="mt-2 text-xs font-semibold text-navy leading-snug transition-colors duration-200 group-hover:text-red line-clamp-2">
                              {r.name}
                            </p>
                            {r.note && (
                              <p className="mt-1 text-[10px] text-muted leading-relaxed line-clamp-2">
                                {r.note}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* Back link */}
              <div className="pt-1 text-center">
                <Link
                  href={`/formations/${categorySlug}`}
                  className="group inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-navy"
                >
                  <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <span>Toutes les formations</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>

      <CTASection page="formations" />
    </main>
  );
}
