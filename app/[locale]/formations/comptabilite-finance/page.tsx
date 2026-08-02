import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import FormationCards from "@/components/FormationCards";
import FAQSection from "@/components/FAQSection";
import FAQJsonLd from "@/components/FAQJsonLd";
import CTASection from "@/components/CTASection";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import { comptaFinance } from "@/lib/formations";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata");
  const title = t("comptabiliteFinance");
  const description = t("formationsDescription");
  return {
    title,
    description,
    alternates: {
      canonical: `https://www.lewaconsultingroup.com/${locale}/formations/comptabilite-finance`,
      languages: {
        fr: "https://www.lewaconsultingroup.com/fr/formations/comptabilite-finance",
        en: "https://www.lewaconsultingroup.com/en/formations/comptabilite-finance",
        "x-default": "https://www.lewaconsultingroup.com/fr/formations/comptabilite-finance",
      },
    },
    openGraph: {
      type: "website",
      url: `https://www.lewaconsultingroup.com/${locale}/formations/comptabilite-finance`,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ComptabiliteFinancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <main>
      <PageHeader
        texts={[
          {
            title: t('formations.catComptaTitle'),
            lead: t('formations.catComptaLead'),
          },
          {
            title: t('formations.catComptaTitle2'),
            lead: t('formations.catComptaLead2'),
          },
          {
            title: t('formations.catComptaTitle3'),
            lead: t('formations.catComptaLead3'),
          },
        ]}
        backgrounds={getHeroBackgrounds("formations")}
      />

      <Container className="py-14 sm:py-16">
        <div className="mb-8">
          <h2 className="font-display text-2xl text-navy">
            {t('formations.catComptaSectionTitle')}
          </h2>
          <p className="mt-2 text-sm text-muted max-w-lg">
            {t('formations.catComptaCount', { count: comptaFinance.length })}
          </p>
        </div>

        <FormationCards rows={comptaFinance} />


        <FAQJsonLd
          items={[
            { q: t('faq.q1'), r: t('faq.r1') },
            { q: t('faq.q2'), r: t('faq.r2') },
            { q: t('faq.q3'), r: t('faq.r3') },
            { q: t('faq.q4'), r: t('faq.r4') },
            { q: t('faq.q5'), r: t('faq.r5') },
            { q: t('faq.q6'), r: t('faq.r6') },
          ]}
        />
        <FAQSection
          title={t('faq.title')}
          image="https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/equipe-kpi.avif"
          imageAlt="Comptabilité et finance"
          items={[
            { q: t('faq.q1'), r: t('faq.r1') },
            { q: t('faq.q2'), r: t('faq.r2') },
            { q: t('faq.q3'), r: t('faq.r3') },
            { q: t('faq.q4'), r: t('faq.r4') },
            { q: t('faq.q5'), r: t('faq.r5') },
            { q: t('faq.q6'), r: t('faq.r6') },
          ]}
        />
      </Container>

      <CTASection page="formations" />
    </main>
  );
}
