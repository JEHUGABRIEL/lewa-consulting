import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import CTASection from "@/components/CTASection";
import HeroSlider from "@/components/HeroSlider";
import ServiceTOC from "@/components/ServiceTOC";
import LevelBadge from "@/components/LevelBadge";
import BlurImage from "@/components/BlurImage";
import {
  servicesData,
  getServiceBySlug,
  serviceFormations,
} from "@/lib/services";
import { getFormationBySlug } from "@/lib/formations";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    servicesData.map((s) => ({ locale, slug: s.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const service = getServiceBySlug(slug);
  const t = await getTranslations();
  if (!service) return { title: t('services.notFound') };
  const title = t(`services.items.${service.slug}.title`);
  const description = t(`services.items.${service.slug}.desc`);
  // Recadrage paysage 1200×630 (ratio 1.91:1) pour des cartes de partage propres.
  const image = `${service.image.split("?")[0]}?w=1200&h=630&fit=crop&crop=faces`;
  return {
    title,
    description,
    alternates: {
      canonical: `https://www.lewaconsultingroup.com/${locale}/services/${service.slug}`,
      languages: {
        fr: `https://www.lewaconsultingroup.com/fr/services/${service.slug}`,
        en: `https://www.lewaconsultingroup.com/en/services/${service.slug}`,
        "x-default": `https://www.lewaconsultingroup.com/fr/services/${service.slug}`,
      },
    },
    openGraph: {
      type: "website",
      url: `https://www.lewaconsultingroup.com/${locale}/services/${service.slug}`,
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

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const related = servicesData.filter((s) => s.slug !== service.slug);

  // Formations liées au domaine (via la carte serviceFormations de lib/services.ts)
  const relatedFormations = (serviceFormations[service.slug] ?? [])
    .map((fSlug) => getFormationBySlug(fSlug))
    .filter((f): f is NonNullable<typeof f> => f !== undefined);

  const heroBgs = getHeroBackgrounds("services");

  // Étapes du bloc « Comment ça marche » (partagées par tous les domaines)
  const steps = [1, 2, 3, 4] as const;

  const tocItems = [
    { id: "a-propos", label: t('services.tocAbout') },
    { id: "prestations", label: t('services.servicesList') },
    { id: "comment-ca-marche", label: t('services.howItWorksTitle') },
    ...(relatedFormations.length > 0
      ? [{ id: "formations-liees", label: t('services.relatedFormationsTitle') }]
      : []),
  ];

  return (
    <main>
      {/* Hero avec slider */}
      <section className="relative overflow-hidden">
        <HeroSlider slides={heroBgs} interval={5000} />

        <Container className="relative z-10 py-24 sm:py-[7.5rem]">
          <Reveal as="div" delay={100}>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-block h-1.5 w-10 rounded-full bg-gradient-to-r from-gold to-gold-bright" />
                  <span>{t(`services.items.${service.slug}.tags`).split("\n").map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                      {tag}
                    </span>
                  ))}</span>
                </div>

                <h1 className="font-display text-3xl leading-tight text-white sm:text-4xl">
                  {t(`services.items.${service.slug}.title`)}
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-white/70 max-w-xl">
                  {t(`services.items.${service.slug}.desc`)}
                </p>
              </div>

            </div>
          </Reveal>
        </Container>
      </section>

      {/* Contenu principal */}
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Colonne principale */}
          <div>
            {/* À propos */}
            <Reveal as="div">
              <section id="a-propos" className="scroll-mt-28">
                <h2 className="font-display text-xl text-navy">
                  {t('services.aboutTitle')}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/75">
                  {t(`services.items.${service.slug}.details`).split("\n").map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </section>
            </Reveal>

            {/* Prestations */}
            <Reveal as="div" delay={100}>
              <section id="prestations" className="mt-8 scroll-mt-28 rounded-xl bg-white p-6 shadow-sm">
                <h3 className="font-display text-base font-semibold text-navy mb-4">
                  {t('services.servicesList')}
                </h3>
                <ul className="space-y-3">
                  {t(`services.items.${service.slug}.points`).split("\n").map((p) => (
                    <li key={p} className="flex gap-3 text-sm text-ink/70">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold/60" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>

            {/* Comment ça marche */}
            <Reveal as="div" delay={100}>
              <section id="comment-ca-marche" className="mt-10 scroll-mt-28">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  <span className="inline-block h-px w-4 bg-gold/50" />
                  {t('services.howItWorksTitle')}
                </div>
                <p className="mt-2 max-w-xl text-sm text-muted">
                  {t('services.howItWorksLead')}
                </p>
                <ol className="mt-6 grid gap-4 sm:grid-cols-2">
                  {steps.map((n) => (
                    <li
                      key={n}
                      className="group relative overflow-hidden rounded-xl border border-transparent bg-white p-5 shadow-sm transition hover:border-navy/20 hover:shadow-md"
                    >
                      {/* Numéro en filigrane */}
                      <span
                        className="pointer-events-none absolute -right-2 -top-4 select-none font-display text-7xl font-semibold text-navy/[0.04] transition-colors duration-300 group-hover:text-gold/[0.08]"
                        aria-hidden="true"
                      >
                        {n}
                      </span>
                      <div className="relative">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-bright text-xs font-semibold text-white shadow-sm">
                          {n}
                        </span>
                        <h3 className="mt-3 font-display text-sm font-semibold text-navy">
                          {t(`services.howStep${n}Title`)}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-ink/70">
                          {t(`services.howStep${n}Desc`)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </Reveal>

            {/* Formations liées */}
            {relatedFormations.length > 0 && (
              <Reveal as="div" delay={150}>
                <section id="formations-liees" className="mt-10 scroll-mt-28">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                    <span className="inline-block h-px w-4 bg-gold/50" />
                    {t('services.relatedFormationsTitle')}
                  </div>
                  <p className="mt-2 max-w-xl text-sm text-muted">
                    {t('services.relatedFormationsLead')}
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedFormations.map((f) => (
                      <Link
                        key={f.slug}
                        href={`/formations/${f.slug}`}
                        className="group block"
                      >
                        <div className="overflow-hidden rounded-xl border border-transparent bg-white shadow-sm transition-all duration-200 hover:border-navy/20 hover:shadow-md">
                          <div className="relative h-28 w-full overflow-hidden">
                            <BlurImage
                              src={f.image}
                              alt={t(`formations.items.${f.slug}.imageAlt`)}
                              className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                          </div>
                          <div className="p-3.5">
                            <div className="flex items-center gap-2">
                              {f.level && <LevelBadge level={f.level} />}
                              <span className="font-mono text-[9px] text-muted/60 tabular">
                                {f.price} FCFA
                              </span>
                            </div>
                            <p className="mt-2 text-xs font-semibold text-navy leading-snug transition-colors duration-200 group-hover:text-red line-clamp-2">
                              {t(`formations.items.${f.slug}.name`)}
                            </p>
                            <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gold">
                              <span>{t('services.viewFormation')}</span>
                              <span className="transition-transform duration-300 group-hover:translate-x-0.5">&rarr;</span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              </Reveal>
            )}
          </div>

          {/* Sidebar — Sommaire + Services liés */}
          <Reveal as="div" delay={150}>
            <div className="sticky top-28 space-y-4">
              {/* Sommaire ancré */}
              <ServiceTOC title={t('services.tocTitle')} items={tocItems} />

              {related.length > 0 && (
                <>
                  {/* Titre avec séparateurs dorés */}
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                    <span className="inline-block h-px flex-1 bg-gold/30" />
                    <span>{t('services.discoverAlso')}</span>
                    <span className="inline-block h-px flex-1 bg-gold/30" />
                  </div>

                  {/* Cartes */}
                  <div className="space-y-4">
                    {related.slice(0, 1).map((r) => (
                      <Link
                        key={r.slug}
                        href={`/services/${r.slug}`}
                        className="group block"
                      >
                        <div className="overflow-hidden rounded-xl border border-transparent bg-white shadow-sm transition-all duration-200 hover:border-navy/20 hover:shadow-md">
                          {/* Image */}
                          <div className="relative h-28 w-full overflow-hidden">
                            <Image
                              src={r.image.split("?")[0]}
                              alt={t(`services.items.${r.slug}.imageAlt`)}
                              fill
                              sizes="(max-width: 768px) 50vw, 25vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                          </div>
                          {/* Contenu */}
                          <div className="p-3.5">
                            <span className="inline-flex items-center rounded-full bg-navy/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-navy">
                              {t(`services.items.${r.slug}.tags`).split("\n")[0]}
                            </span>
                            <p className="mt-2 text-xs font-semibold text-navy leading-snug transition-colors duration-200 group-hover:text-red line-clamp-2">
                              {t(`services.items.${r.slug}.title`)}
                            </p>
                            <p className="mt-1.5 text-[10px] text-muted leading-relaxed line-clamp-2">
                              {t(`services.items.${r.slug}.short`)}
                            </p>
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
                  href="/services"
                  className="group inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-navy"
                >
                  <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  <span>{t('services.allExpertises')}</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>

      <CTASection page="services" />
    </main>
  );
}
