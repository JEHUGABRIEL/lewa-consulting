import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import FormationsFilter from "@/components/FormationsFilter";
import FAQSection from "@/components/FAQSection";
import FAQJsonLd from "@/components/FAQJsonLd";
import CTASection from "@/components/CTASection";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import { getPublicFormations } from "@/lib/admin/public";
import { formationCategories } from "@/lib/formations";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata");
  const title = t("formations");
  const description = t("formationsDescription");
  return {
    title,
    description,
    alternates: {
      canonical: `https://www.lewaconsultingroup.com/${locale}/formations`,
      languages: {
        fr: "https://www.lewaconsultingroup.com/fr/formations",
        en: "https://www.lewaconsultingroup.com/en/formations",
        "x-default": "https://www.lewaconsultingroup.com/fr/formations",
      },
    },
    openGraph: {
      type: "website",
      url: `https://www.lewaconsultingroup.com/${locale}/formations`,
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

export default async function FormationsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const allRows = await getPublicFormations();

  const categories = formationCategories.map((c) => ({
    id: c.id,
    label: t(c.id === "compta" ? "formations.catComptaTitle" : "formations.catBureautiqueTitle"),
    rows: allRows.filter((r) => r.category === c.id),
  }));

  return (
    <main>
      <PageHeader
        texts={[
          {
            title: t('formations.indexTitle'),
            lead: t('formations.indexLead'),
          },
          {
            title: t('formations.indexTitle2'),
            lead: t('formations.indexLead2'),
          },
          {
            title: t('formations.indexTitle3'),
            lead: t('formations.indexLead3'),
          },
        ]}
        backgrounds={getHeroBackgrounds("formations")}
      />

      <Container className="py-14 sm:py-16">
        <div className="mb-8">
          <h2 className="font-display text-2xl text-navy">
            {t('formations.indexSectionTitle')}
          </h2>
          <p className="mt-2 text-sm text-muted max-w-lg">
            {t('formations.indexSectionLead')}
          </p>
        </div>

        <FormationsFilter categories={categories} />

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
          imageAlt="Formations professionnelles COSI LEWA"
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
