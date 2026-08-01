import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import CTASection from "@/components/CTASection";
import HeroSlider from "@/components/HeroSlider";
import { servicesData, getServiceBySlug } from "@/lib/services";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return servicesData.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  const t = await getTranslations();
  if (!service) return { title: t('services.notFound') };
  return {
    title: t(`services.items.${service.slug}.title`),
    description: t(`services.items.${service.slug}.desc`),
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const t = await getTranslations();
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const related = servicesData.filter((s) => s.slug !== service.slug);

  const heroBgs = getHeroBackgrounds("services");

  return (
    <main>
      {/* Hero avec slider */}
      <section className="relative overflow-hidden border-b border-navy-deep">
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
            <Reveal as="div">
              <h2 className="font-display text-xl text-navy">
                {t('services.aboutTitle')}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink/75">
                {t(`services.items.${service.slug}.details`).split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>

            {/* Points clés */}
            <Reveal as="div" delay={100}>
              <div className="mt-8 rounded-xl border border-border bg-white p-6">
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
              </div>
            </Reveal>

            {/* Bénéfices */}
            <Reveal as="div" delay={150}>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {t(`services.items.${service.slug}.benefits`).split("\n").map((b) => (
                  <div key={b} className="flex items-start gap-3 rounded-lg bg-navy/[0.02] p-4 text-sm leading-relaxed text-ink/70">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Sidebar — Services liés */}
          <Reveal as="div" delay={150}>
            <div className="sticky top-28 space-y-4">
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
                    {related.slice(0, 3).map((r) => (
                      <Link
                        key={r.slug}
                        href={`/services/${r.slug}`}
                        className="group block"
                      >
                        <div className="overflow-hidden rounded-xl border border-border bg-white transition-all duration-200 hover:border-navy/20 hover:shadow-sm">
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
