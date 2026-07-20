import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import CTASection from "@/components/CTASection";
import HeroSlider from "@/components/HeroSlider";
import Mark from "@/components/Mark";
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
  if (!service) return { title: "Service introuvable" };
  return { title: service.title };
}

const expertiseIcon = (icon: string) => {
  const cls = "h-5 w-5";
  switch (icon) {
    case "compta":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="3" width="20" height="18" rx="2" />
          <line x1="6" y1="7" x2="18" y2="7" />
          <line x1="6" y1="11" x2="18" y2="11" />
          <line x1="6" y1="15" x2="12" y2="15" />
        </svg>
      );
    case "conseil":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "rh":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "formation":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M8 7h8" />
          <path d="M8 11h6" />
        </svg>
      );
    case "privee":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "juridique":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    default:
      return null;
  }
};

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
        {/* Top accent bar */}
        <div className="relative z-20 h-[3px] w-full bg-gradient-to-r from-gold-bright via-red to-navy" />

        <HeroSlider slides={heroBgs} interval={5000} />

        {/* Décor géométrique */}
        <div className="pointer-events-none absolute -right-20 -top-16 z-10 select-none text-white/[0.06]" aria-hidden="true">
          <Mark className="h-48 w-48" />
        </div>

        <Container className="relative z-10 py-24 sm:py-[7.5rem]">
          <Reveal as="div" delay={100}>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <span className="inline-block h-1.5 w-10 rounded-full bg-gradient-to-r from-gold to-gold-bright" />
                  <span>{service.tags.map((t) => (
                    <span key={t} className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
                      {t}
                    </span>
                  ))}</span>
                </div>

                <h1 className="font-display text-3xl leading-tight text-white sm:text-4xl">
                  {service.title}
                </h1>

                <p className="mt-3 text-sm leading-relaxed text-white/70 max-w-xl">
                  {service.desc}
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
                {service.details.map((p, i) => (
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
                  {service.points.map((p) => (
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
                {service.benefits.map((b) => (
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
                            <img
                              src={r.image}
                              alt={r.imageAlt}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
                          </div>
                          {/* Contenu */}
                          <div className="p-3.5">
                            <span className="inline-flex items-center rounded-full bg-navy/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-navy">
                              {r.tags[0]}
                            </span>
                            <p className="mt-2 text-xs font-semibold text-navy leading-snug transition-colors duration-200 group-hover:text-red line-clamp-2">
                              {r.title}
                            </p>
                            <p className="mt-1.5 text-[10px] text-muted leading-relaxed line-clamp-2">
                              {r.short}
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
