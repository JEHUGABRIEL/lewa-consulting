import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import CTASection from "@/components/CTASection";
import BlurImage from "@/components/BlurImage";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: t("aPropos"),
    description: t("aProposDescription"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations();

  return (
    <main>
      <PageHeader
        texts={[
          {
            title: t('about.title'),
            lead: t('about.lead'),
          },
        ]}
        backgrounds={getHeroBackgrounds("formations")}
      />

      <Container className="py-14 sm:py-16">
        {/* Direction générale */}
        <section className="mt-2 sm:mt-4">
          <Reveal as="div">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                <span className="inline-block h-px w-4 bg-gold/50" />
                {t('about.directionEyebrow')}
                <span className="inline-block h-px w-4 bg-gold/50" />
              </span>
              <h2 className="mt-4 font-display text-2xl leading-tight text-navy sm:text-3xl">
                {t('about.directionTitle')}
              </h2>
            </div>
          </Reveal>

          <Reveal as="div" delay={100}>
            <div className="relative mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl bg-white p-8 shadow-sm sm:p-10">
              {/* Décor géométrique discret */}
              <div className="pointer-events-none absolute inset-0 select-none" aria-hidden="true">
                <svg className="absolute -right-10 -top-10 h-44 w-44 opacity-[0.05]" viewBox="0 0 200 200" fill="none">
                  <circle cx="100" cy="100" r="80" stroke="#C99A2E" strokeWidth="1" />
                  <circle cx="100" cy="100" r="55" stroke="#C99A2E" strokeWidth="0.5" />
                </svg>
                <span className="absolute bottom-6 right-8 select-none font-display text-7xl font-semibold text-navy/[0.04]" aria-hidden="true">
                  L
                </span>
              </div>

              <div className="relative grid gap-8 sm:grid-cols-[300px_1fr] sm:items-start">
                {/* Photo du directeur */}
                <div className="relative mx-auto w-full max-w-[300px] overflow-hidden rounded-xl shadow-sm sm:mx-0">
                  <BlurImage
                    src="/qui_sommes_nous/directeur.png"
                    alt={t('about.directorName')}
                    className="aspect-[4/5] w-full"
                    eager
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-navy/10" aria-hidden="true" />
                </div>

                <div>
                  {/* Bandeau nom + rôle */}
                  <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        {t('about.directionLead')}
                      </p>
                      <h3 className="mt-1.5 font-display text-2xl font-semibold text-navy sm:text-3xl">
                        {t('about.directorName')}
                      </h3>
                    </div>
                    <span className="inline-flex shrink-0 items-center rounded-full bg-gold/10 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold sm:text-xs">
                      {t('about.directorRole')}
                    </span>
                  </div>

                  {/* Bio */}
                  <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/75">
                    <p>{t('about.directorBio1')}</p>
                    <p className="border-l-2 border-gold/40 pl-4 text-ink/85">
                      {t('about.directorBio2')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </Container>

      <CTASection page="aPropos" />
    </main>
  );
}
