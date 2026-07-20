"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import Container from "./Container";
import Reveal from "./Reveal";

type PageKey = "home" | "services" | "formations" | "aPropos" | "contact";

const pageKeyMap: Record<PageKey, string> = {
  home: "",
  services: "services",
  formations: "formations",
  aPropos: "aPropos",
  contact: "contact",
};

export default function CTASection({ page }: { page: PageKey }) {
  const t = useTranslations();
  const prefix = pageKeyMap[page];
  const title = prefix ? t(`cta.${prefix}Title`) : t('cta.title');
  const text = prefix ? t(`cta.${prefix}Text`) : t('cta.subtitle');
  const primaryLabel = prefix ? t(`cta.${prefix}Primary`) : t('cta.contact');
  const secondaryLabel = prefix ? t(`cta.${prefix}Secondary`) : t('cta.services');

  const primaryHref = page === "contact" ? "tel:+23672696700" : "/contact";
  const secondaryHref = page === "formations" ? "/services" : "/formations/comptabilite-finance";

  return (
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
                {title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                {text}
              </p>
            </Reveal>

            <Reveal as="div" delay={150}>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {primaryHref.startsWith("tel:") ? (
                  <a
                    href={primaryHref}
                    className="inline-flex items-center gap-2 rounded-full bg-gold-bright px-6 py-3 font-display text-sm font-semibold text-navy transition-all duration-300 hover:bg-gold hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {primaryLabel}
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                ) : (
                  <Link
                    href={primaryHref}
                    className="inline-flex items-center gap-2 rounded-full bg-gold-bright px-6 py-3 font-display text-sm font-semibold text-navy transition-all duration-300 hover:bg-gold hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {primaryLabel}
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                )}
                <Link
                  href={secondaryHref}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white/85 transition-all duration-300 hover:border-white/50 hover:text-white"
                >
                  {secondaryLabel}
                </Link>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Accent bar bottom */}
        <div className="relative z-10 h-[3px] w-full bg-gradient-to-r from-gold-bright via-red to-navy" />
      </section>
    </Container>
  );
}
