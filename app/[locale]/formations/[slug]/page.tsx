import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import LevelBadge from "@/components/LevelBadge";
import HeroSlider from "@/components/HeroSlider";
import BlurImage from "@/components/BlurImage";
import CTASection from "@/components/CTASection";
import EnrollButton from "@/components/EnrollButton";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import {
  getPublicFormationBySlug,
  getPublicFormations,
  getPublicFormationsByCategory,
} from "@/lib/admin/public";
type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  const formations = await getPublicFormations();
  return routing.locales.flatMap((locale) =>
    formations.map((f) => ({ locale, slug: f.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const formation = await getPublicFormationBySlug(slug);
  const t = await getTranslations();
  if (!formation) return { title: t("formations.notFound") };
  const title = t(`formations.items.${formation.slug}.name`);
  const description = t(`formations.items.${formation.slug}.desc`);

  const image = `${formation.image.split("?")[0]}?w=1200&h=630&fit=crop&crop=faces`;
  return {
    title,
    description,
    alternates: {
      canonical: `https://www.lewaconsultingroup.com/${locale}/formations/${formation.slug}`,
      languages: {
        fr: `https://www.lewaconsultingroup.com/fr/formations/${formation.slug}`,
        en: `https://www.lewaconsultingroup.com/en/formations/${formation.slug}`,
        "x-default": `https://www.lewaconsultingroup.com/fr/formations/${formation.slug}`,
      },
    },
    openGraph: {
      type: "website",
      url: `https://www.lewaconsultingroup.com/${locale}/formations/${formation.slug}`,
      title,
      description,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function FormationDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const formation = await getPublicFormationBySlug(slug);
  if (!formation) notFound();


  const categoryTitle = (id: string) =>
    id === "compta" ? "formations.catComptaTitle" : "formations.catBureautiqueTitle";
  const categoryLabel = t(categoryTitle(formation.category));

  const [allFormations, related] = await Promise.all([
    getPublicFormations(),
    getPublicFormationsByCategory(formation.category),
  ]);
  const relatedRows = related.filter((f) => f.slug !== formation.slug).slice(0, 2);


  const heroBgs = getHeroBackgrounds("formations");

  return (
    <main>
      { }
      <section className="relative overflow-hidden">
        <HeroSlider slides={heroBgs} interval={5000} />

        <Container className="relative z-10 py-24 sm:py-[7.5rem]">
          <Reveal as="div">
            { }
            <Link
              href="/formations"
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
              <span>{t('formations.backLink')}</span>
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
                  {t(`formations.items.${formation.slug}.name`)}
                </h1>

                {(() => {
                  const note = t(`formations.items.${formation.slug}.note`);
                  return note ? (
                    <p className="mt-3 text-sm leading-relaxed text-white/70">
                      {note}
                    </p>
                  ) : null;
                })()}
              </div>

            </div>

            { }
            <EnrollButton
              formationSlug={formation.slug}
              formationName={t(`formations.items.${formation.slug}.name`)}
              alternatives={allFormations
                .filter((f) => f.slug !== formation.slug)
                .map((r) => ({
                  slug: r.slug,
                  name: t(`formations.items.${r.slug}.name`),
                }))}
            />
          </Reveal>
        </Container>
      </section>

      { }
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          { }
          <div className="min-w-0">
            <Reveal as="div">
              <h2 className="font-display text-xl text-navy">
                {t('formations.aboutTitle')}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/75">
                <p dangerouslySetInnerHTML={{ __html: t.raw('formations.aboutPara1') }} />
                <p dangerouslySetInnerHTML={{ __html: t.raw('formations.aboutPara2') }} />
                <p dangerouslySetInnerHTML={{ __html: t.raw('formations.aboutPara3') }} />
              </div>
            </Reveal>

            <Reveal as="div" delay={100}>
              <div className="mt-8 flex items-start gap-3 rounded-lg bg-navy/[0.02] p-5 text-sm">
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
                    {t('formations.flexibleTitle')}
                  </p>
                  <p className="mt-1 text-muted leading-relaxed">
                    {t('formations.flexibleDesc')}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          { }
          <Reveal as="div" delay={150} className="min-w-0">
            <div className="sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain [scrollbar-width:thin] space-y-4">
              {relatedRows.length > 0 && (
                <>
                  { }
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                    <span className="inline-block h-px flex-1 bg-gold/30" />
                    <span>{t('formations.otherTitle')} <span className="lowercase">{categoryLabel}</span></span>
                    <span className="inline-block h-px flex-1 bg-gold/30" />
                  </div>

                  { }
                  <div className="space-y-4">
                    {relatedRows.map((r) => (
                      <Link
                        key={r.slug}
                        href={`/formations/${r.slug}`}
                        className="group block"
                      >
                        <div className="overflow-hidden rounded-xl border border-transparent bg-white shadow-sm transition-all duration-200 hover:border-navy/20 hover:shadow-md">
                          { }
                          <div className="relative h-24 w-full overflow-hidden">
                            <BlurImage
                              src={r.image}
                              alt={t(`formations.items.${r.slug}.imageAlt`)}
                              className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                          </div>
                          { }
                          <div className="p-3.5">
                            <div className="flex items-center gap-2">
                              {r.level && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-navy/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-navy">
                                  {r.level === "debutant" && <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />}
                                  {r.level === "intermediaire" && <span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-500" />}
                                  {r.level === "avance" && <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />}
                                  {r.level === "debutant" ? t('formations.debutant') : r.level === "intermediaire" ? t('formations.intermediaire') : t('formations.avance')}
                                </span>
                              )}
                              <span className="font-mono text-[9px] text-muted/60 tabular">
                                {r.price} FCFA
                              </span>
                            </div>
                            <p className="mt-2 text-xs font-semibold text-navy leading-snug transition-colors duration-200 group-hover:text-red line-clamp-2">
                              {t(`formations.items.${r.slug}.name`)}
                            </p>
                            {(() => {
                              const note = t(`formations.items.${r.slug}.note`);
                              return note ? (
                                <p className="mt-1 text-[10px] text-muted leading-relaxed line-clamp-2">
                                  {note}
                                </p>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              { }
              <div className="pt-1 text-center">
                <Link
                  href="/formations"
                  className="group inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-navy"
                >
                  <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <span>{t('common.allFormations')}</span>
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
