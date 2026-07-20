"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Container from "@/components/Container";
import Mark from "@/components/Mark";
import Reveal from "@/components/Reveal";
import HeroSlider from "@/components/HeroSlider";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import LevelBadge from "@/components/LevelBadge";
import { featuredFormations } from "@/lib/formations";
import { servicesData } from "@/lib/services";
import { heroTexts, aboutUs, ourMission } from "@/lib/content";
import { testimonials } from "@/lib/testimonials";
import { partners } from "@/lib/partners";
import PostIllustration from "@/components/PostIllustration";
import BlurImage from "@/components/BlurImage";
import { posts } from "@/lib/posts";

// ---- Fonction icône pour les expertises ----

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

// ---- Composant carousel de témoignages ----

function TestimonialCard({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <div className="relative flex h-full flex-col rounded-xl border border-border bg-white p-6">
      <div className="absolute -top-3 -left-2 text-5xl leading-none text-gold/15 select-none pointer-events-none" aria-hidden="true">
        &ldquo;
      </div>
      <div className="mb-3 flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="h-3.5 w-3.5 text-gold" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <blockquote className="text-sm leading-relaxed text-ink/80 flex-1">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <BlurImage
          src={t.image}
          alt={t.imageAlt}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-navy">{t.name}</p>
          <p className="truncate text-xs text-muted">{t.role}, {t.org}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialCarousel() {
  const [paused, setPaused] = useState(false);
  const duplicated = [...testimonials, ...testimonials];

  return (
    <div
      className="relative mt-10 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Dégradés de bord pour fondu */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-navy/[0.02] via-navy/[0.01] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-navy/[0.02] via-navy/[0.01] to-transparent" />

      <div
        className="flex"
        style={{
          animation: `marquee ${testimonials.length * 8}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          width: "fit-content",
        }}
      >
        {duplicated.map((t, i) => (
          <div key={`${t.name}-${i}`} className="w-[90vw] max-w-[420px] shrink-0 px-3">
            <TestimonialCard t={t} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Composant carousel partenaires ----

function PartnerCard({ p }: { p: (typeof partners)[number] }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-white p-4 text-center w-40 shrink-0">
      <div className="relative mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-navy/[0.03] to-navy/[0.06]">
        <img
          src={p.image.replace("w=100&q=80", "w=112&h=112&fit=crop&q=60")}
          alt={p.imageAlt}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <h3 className="text-[11px] font-semibold text-navy leading-snug">{p.name}</h3>
      <p className="mt-0.5 text-[9px] text-muted uppercase tracking-wider">{p.tagline}</p>
    </div>
  );
}

function PartnerCarousel() {
  const [paused, setPaused] = useState(false);
  const duplicated = [...partners, ...partners];

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-paper to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-paper to-transparent" />

      <div
        className="flex"
        style={{
          animation: `marquee ${partners.length * 8}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          width: "fit-content",
        }}
      >
        {duplicated.map((p, i) => (
          <div key={`${p.name}-${i}`} className="px-2">
            <PartnerCard p={p} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Carousel des chiffres clés (1 à la fois) ----

function StatCarousel({ stats }: { stats: typeof aboutUs.stats }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(id);
  }, [stats.length, paused]);

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-xl border border-white/20 bg-white/90 px-4 py-3 text-center shadow-lg backdrop-blur-sm">
        {/* Valeur animée */}
        <div className="relative min-h-[60px]">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`transition-all duration-500 ${
                i === current
                  ? "visible translate-y-0 opacity-100"
                  : "invisible absolute inset-0 translate-y-3 opacity-0"
              }`}
            >
              <p className="font-display text-xl font-bold text-navy tabular">
                {s.value}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Icône décorative */}
        <div className="pointer-events-none absolute -bottom-2 -right-2 select-none text-navy/[0.03]">
          <svg className="h-16 w-16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ---- Composant compteur animé ----

function AnimatedCounter({
  target,
  suffix = "",
  label,
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  label: string;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          observer.unobserve(el);

          const start = performance.now();

          function step(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));

            if (progress < 1) {
              requestAnimationFrame(step);
            }
          }

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <div ref={ref} className="text-center">
      <span className="font-display text-4xl font-bold text-white sm:text-5xl tabular">
        {count}
        {suffix}
      </span>
      <p className="mt-2 text-sm text-white/65 leading-snug">{label}</p>
    </div>
  );
}

export default function Home() {
  const t = useTranslations();
  const backgrounds = getHeroBackgrounds("home");
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <main>
      {/* ================================================
           HERO — section principale avec slider
           ================================================ */}
      <section className="relative overflow-hidden border-b border-navy-deep">
        {/* Top accent bar */}
        <div className="relative z-20 h-[3px] w-full bg-gradient-to-r from-gold-bright via-red to-navy" />

        {/* Slider d'arrière-plans */}
        <HeroSlider slides={backgrounds} interval={5000} onSlideChange={setCurrentSlide} />

        {/* Décor géométrique subtil */}
        <div className="pointer-events-none absolute -right-20 -top-16 z-10 select-none text-white/[0.06]" aria-hidden="true">
          <Mark className="h-48 w-48" />
        </div>

        <Container className="relative z-10 py-[7.5rem] sm:py-[10.5rem]">
          <div className="flex items-center gap-3 animate-fade-in">
            <span className="inline-block h-px w-6 bg-gold" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-bright">
              {t('common.tagline')}
            </p>
          </div>

          <div key={currentSlide} className="animate-fade-in">
            <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-5xl text-white animate-scale-in delay-100">
              {heroTexts[currentSlide].title}
            </h1>

            <div className="mt-6 h-px w-16 bg-gold-bright/50 animate-draw-line delay-200" />

            <p className="mt-5 max-w-2xl leading-relaxed text-white/80 animate-slide-up delay-300">
              {heroTexts[currentSlide].lead}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm animate-slide-up delay-500">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-bright px-5 py-2.5 font-semibold text-navy transition-all duration-300 hover:bg-gold hover:-translate-y-0.5 hover:shadow-lg"
            >
              {t('common.ourServices')}
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/20 hover:text-white"
            >
              {t('common.contact')}
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </Link>
          </div>
        </Container>
      </section>

      {/* ================================================
           QUI SOMMES-NOUS
           ================================================ */}
      <section className="border-b border-border bg-navy/[0.02]">
        <Container className="py-14 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-5">
            {/* Texte */}
            <Reveal as="div" className="lg:col-span-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                <span className="inline-block h-px w-4 bg-gold/50" />
                {t('about.eyebrow')}
              </span>
              <h2 className="mt-4 font-display text-2xl leading-tight text-navy sm:text-3xl">
                {t('about.title')}
              </h2>
              <p className="mt-2 text-sm text-muted max-w-lg">
                {aboutUs.lead}
              </p>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/75">
                {aboutUs.paragraphs.map((p, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </div>

              {/* Lien vers nos services */}
              <div className="mt-8">
                <Link
                  href="/services"
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-navy transition hover:text-red"
                >
                  <span>{t('common.discoverExpertise')}</span>
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                  <span className="block h-px max-w-0 bg-red transition-all duration-300 group-hover:max-w-full" />
                </Link>
              </div>
            </Reveal>

            {/* Stats + image */}
            <Reveal as="div" delay={100} className="lg:col-span-2">
              <div className="sticky top-28">
                {/* Image du cabinet avec chiffres clés superposés */}
                <div className="relative h-96 w-full overflow-hidden rounded-2xl">
                  <BlurImage
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80"
                    alt="Bureau du Cabinet COSI Lewa-Consulting Group"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                  {/* Chiffres clés superposés en bas à droite */}
                  <div className="absolute bottom-0 right-0 z-10 p-4">
                    <div className="max-w-[180px]">
                      <StatCarousel stats={aboutUs.stats} />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ================================================
           DOMAINES D'INTERVENTION — les 6 expertises
           ================================================ */}
      <section className="border-b border-border">
        <Container className="py-14 sm:py-16">
          <h2 className="font-display text-2xl text-navy animate-fade-in">
            {t('services.title')}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
            {servicesData.map((s, i) => (
              <Link key={s.slug} href={`/services/${s.slug}`}>
                <Reveal as="div" delay={i * 60}>
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white hover-lift">
                    {/* Image Unsplash en haut avec blur-up */}
                    <div className="relative h-44 w-full overflow-hidden rounded-t-xl">
                      <BlurImage
                        src={s.image}
                        alt={s.imageAlt}
                        className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {/* Icone par-dessus l'image */}
                      <span className="absolute bottom-3 left-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-navy shadow-sm backdrop-blur-sm transition-colors duration-200 group-hover:bg-gold group-hover:text-navy">
                        {expertiseIcon(s.icon)}
                      </span>
                    </div>
                    {/* Contenu */}
                    <div className="flex flex-1 flex-col p-5 lg:p-7 pt-4 lg:pt-5">
                      <h3 className="font-display text-lg font-semibold text-navy transition-colors duration-200 group-hover:text-red">
                        {s.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/75 flex-1">
                        {s.desc}
                      </p>
                      {/* Tags */}
                      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
                        {s.tags.map((t) => (
                          <span key={t} className="inline-flex items-center rounded-full bg-navy/[0.06] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-navy/60">
                            {t}
                          </span>
                        ))}
                      </div>
                      {/* CTA */}
                      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted transition-colors duration-200 group-hover:text-gold">
                        <span>{t('common.learnMore')}</span>
                        <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ================================================
           NOTRE MISSION
           ================================================ */}
      <section className="relative border-b border-border bg-gradient-to-br from-navy to-navy-deep text-paper">
        {/* Fond image subtile */}
        <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=60&fit=crop"
            alt=""
            className="h-full w-full object-cover opacity-[0.06]"
            loading="lazy"
            decoding="async"
          />
        </div>

        <Container className="relative z-10 py-14 sm:py-16">
          <Reveal as="div">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-bright">
              <span className="inline-block h-px w-4 bg-gold-bright/50" />
              {t('mission.eyebrow')}
            </div>
            <h2 className="mt-4 font-display text-2xl leading-tight text-paper sm:text-3xl">
              {t('mission.title')}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-paper/65">
              {ourMission.lead}
            </p>
          </Reveal>

          {/* 4 piliers */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ourMission.items.map((item, i) => (
              <Reveal key={item.title} as="div" delay={i * 80}>
                <div className="group h-full rounded-xl border border-paper/15 bg-white/[0.04] p-6 backdrop-blur-sm transition-colors duration-300 hover:bg-white/[0.07]">
                  <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold-bright/15 text-gold-bright">
                    {item.icon === "shield" && (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    )}
                    {item.icon === "trending" && (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                      </svg>
                    )}
                    {item.icon === "users" && (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    )}
                    {item.icon === "globe" && (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    )}
                  </span>
                  <h3 className="font-display text-base font-semibold text-paper">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-paper/60">
                    {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

        </Container>
      </section>

      {/* ================================================
           FORMATIONS VEDETTES
           ================================================ */}
      <section className="border-b border-border">
        <Container className="py-14 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-navy animate-fade-in">
                {t('formations.title')}
              </h2>
              <p className="mt-2 text-sm text-muted max-w-lg animate-slide-up delay-100">
                {t('formations.subtitle')}
              </p>
            </div>
            <Link
              href="/formations/comptabilite-finance"
              className="group hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-navy transition hover:text-red animate-slide-up delay-200"
            >
              <span>{t('formations.seeAll')}</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
              <span className="block h-px max-w-0 bg-red transition-all duration-300 group-hover:max-w-full" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {featuredFormations.map((f) => (
              <Reveal key={f.name} as="div">
                <Link href={`/formations/${f.slug}`}>
                  <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white hover-lift">
                    {/* Image Unsplash en haut */}
                    <div className="relative h-40 w-full overflow-hidden">
                      <BlurImage
                        src={f.image}
                        alt={f.imageAlt}
                        className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {/* Level badge on image */}
                      {f.level && (
                        <div className="absolute bottom-2 right-2">
                          <LevelBadge level={f.level} />
                        </div>
                      )}
                    </div>
                    {/* Contenu */}
                    <div className="flex flex-1 flex-col p-4 lg:p-5">
                      {/* Top accent */}
                      <span className="inline-block h-1 w-8 shrink-0 rounded-full bg-gradient-to-r from-gold to-gold-bright" />

                      <h3 className="mt-3 font-display text-base font-semibold text-navy transition-colors duration-200 group-hover:text-red">
                        {f.name}
                      </h3>

                      <p className="mt-1.5 text-xs leading-relaxed text-muted flex-1">
                        {f.desc}
                      </p>

                      {/* Price + CTA */}
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                        <span className="inline-block rounded-full bg-gold/10 px-3 py-1 font-mono text-xs font-semibold text-navy tabular tracking-wide">
                          {f.price} FCFA
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors duration-200 group-hover:text-gold">
                          {t('formations.btnInscrire')}
                          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* Mobile link */}
          <div className="mt-8 text-center sm:hidden animate-fade-in">
            <Link
              href="/formations/comptabilite-finance"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-navy transition hover:text-red"
            >
              <span>{t('formations.seeAll')}</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </Container>
      </section>

      {/* ================================================
           TÉMOIGNAGES — carousel 3/2/1
           ================================================ */}
      <section className="border-b border-border bg-navy/[0.02]">
        <Container className="py-14 sm:py-16">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="inline-block h-px w-4 bg-gold/50" />
              {t('testimonials.eyebrow')}
            </span>
            <h2 className="mt-4 font-display text-2xl text-navy animate-fade-in">
              {t('testimonials.title')}
            </h2>
            <p className="mt-2 text-sm text-muted max-w-md animate-slide-up delay-100">
              {t('testimonials.subtitle')}
            </p>
          </div>

          <TestimonialCarousel />
        </Container>
      </section>

      {/* ================================================
           ACTUALITÉS / BLOG
           ================================================ */}
      <section className="border-b border-border">
        <Container className="py-14 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                <span className="inline-block h-px w-4 bg-gold/50" />
                {t('blog.eyebrow')}
                <span className="inline-block h-px w-4 bg-gold/50" />
              </span>
              <h2 className="mt-4 font-display text-2xl text-navy animate-fade-in">
                {t('blog.title')}
              </h2>
              <p className="mt-2 text-sm text-muted max-w-lg animate-slide-up delay-100">
                {t('blog.subtitle')}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {posts.map((post, i) => (
              <Reveal key={post.slug} as="div" delay={i * 60}>
                <div className="group relative flex h-full flex-col rounded-xl border border-border bg-white p-5 hover-lift lg:p-7">
                  {/* Illustration */}
                  <div className="mb-3 h-40 w-full overflow-hidden rounded-lg">
                    <PostIllustration category={post.category} src={post.image} alt={post.imageAlt} />
                  </div>

                  {/* Category badge */}
                  <span className="mb-3 inline-flex items-center rounded-full bg-navy/[0.06] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy">
                    {post.category}
                  </span>

                  {/* Date */}
                  <p className="text-[11px] text-muted">{post.date}</p>

                  {/* Title */}
                  <h3 className="mt-1.5 font-display text-sm font-semibold text-navy leading-snug">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-2 text-xs leading-relaxed text-muted flex-1">
                    {post.excerpt}
                  </p>

                  {/* Read more */}
                  <Link
                    href={`/actualites/${post.slug}`}
                    className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs font-medium text-navy transition-colors duration-200 hover:text-red"
                  >
                    <span>{t('common.readMore')}</span>
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Mobile link */}
          <div className="mt-8 text-center sm:hidden animate-fade-in">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/60">
              <span>{t('blog.followUs')}</span>
              <span className="inline-block">&rarr;</span>
            </span>
          </div>
        </Container>
      </section>

      {/* ================================================
           PARTENAIRES — carousel autodéfilant
           ================================================ */}
      <section className="border-b border-border overflow-hidden">
        <Container className="py-14 sm:py-16">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              <span className="inline-block h-px w-4 bg-gold/50" />
              {t('partners.eyebrow')}
            </span>
            <h2 className="mt-4 font-display text-2xl text-navy animate-fade-in">
              {t('partners.title')}
            </h2>
            <p className="mt-2 text-sm text-muted max-w-md animate-slide-up delay-100">
              {t('partners.subtitle')}
            </p>
          </div>
        </Container>

        <PartnerCarousel />
      </section>





      {/* ================================================
           CTA FINAL
           ================================================ */}
      <Container className="my-10">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-deep">
          {/* Décor géométrique */}
          <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
            <svg className="h-full w-full opacity-[0.04]" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="100,500 200,420 300,500 200,580" fill="#C99A2E" />
              <polygon points="600,100 680,150 680,250 600,300 520,250 520,150" fill="#C99A2E" />
              <circle cx="750" cy="450" r="120" stroke="#C99A2E" strokeWidth="0.5" />
              <circle cx="50" cy="100" r="80" stroke="#C99A2E" strokeWidth="0.5" />
              <line x1="0" y1="300" x2="800" y2="300" stroke="#C99A2E" strokeWidth="0.5" strokeDasharray="3 6" />
            </svg>
          </div>

          <div className="relative z-10 px-6 sm:px-10 py-14 sm:py-16">
            <div className="mx-auto max-w-2xl text-center">
              <Reveal as="div">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold-bright/15">
                  <svg className="h-6 w-6 text-gold-bright" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </span>
                <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl">
                  {t('cta.title')}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  {t('cta.subtitle')}
                </p>
              </Reveal>

              <Reveal as="div" delay={150}>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full bg-gold-bright px-6 py-3 font-display text-sm font-semibold text-navy transition-all duration-300 hover:bg-gold hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {t('cta.contact')}
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white/85 transition-all duration-300 hover:border-white/50 hover:text-white"
                  >
                    {t('cta.services')}
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Accent bar bottom */}
          <div className="relative z-10 h-[3px] w-full bg-gradient-to-r from-gold-bright via-red to-navy" />
        </section>
      </Container>
    </main>
  );
}
