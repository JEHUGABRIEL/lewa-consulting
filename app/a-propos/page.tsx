import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import CTASection from "@/components/CTASection";
import BlurImage from "@/components/BlurImage";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("aPropos") };
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

      {/* Contenu À propos */}
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Texte */}
          <Reveal as="div" className="lg:col-span-3">
            <h2 className="font-display text-2xl leading-tight text-navy sm:text-3xl">
              {t('about.title')}
            </h2>
            <p className="mt-2 text-sm text-muted max-w-lg">
              {t('about.lead')}
            </p>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/75">
              {[t.raw('about.paragraph1'), t.raw('about.paragraph2'), t.raw('about.paragraph3')].map((p, i) => (
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

          {/* Image + chiffres clés */}
          <Reveal as="div" delay={100} className="lg:col-span-2">
            <div className="sticky top-28">
              <div className="relative h-96 w-full overflow-hidden rounded-2xl">
                <BlurImage
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80"
                  alt={t('about.title')}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Chiffres clés */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { value: t('about.stat1Value'), label: t('about.stat1Label') },
                  { value: t('about.stat2Value'), label: t('about.stat2Label') },
                  { value: t('about.stat3Value'), label: t('about.stat3Label') },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-navy/[0.02] p-4 text-center">
                    <p className="font-display text-2xl font-bold text-navy tabular">{s.value}</p>
                    <p className="mt-1 text-[11px] leading-tight text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>

      <CTASection page="aPropos" />
    </main>
  );
}
