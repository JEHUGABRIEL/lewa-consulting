import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import FormationCards from "@/components/FormationCards";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import { comptaFinance } from "@/lib/formations";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Comptabilité & finance" };

export default async function ComptabiliteFinancePage() {
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

        <Reveal as="div" className="mt-12 border-t border-border pt-8 text-sm text-ink/70">
          <div className="flex items-start gap-3 rounded-lg bg-navy/[0.02] p-5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-semibold text-gold">
              i
            </span>
            <div>
              <p>{t('formations.paymentInfo')}</p>
              <p className="mt-2" dangerouslySetInnerHTML={{ __html: t('formations.contactInfo') }} />
            </div>
          </div>
        </Reveal>

        <FAQSection
          title={t('faq.title')}
          image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80"
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
