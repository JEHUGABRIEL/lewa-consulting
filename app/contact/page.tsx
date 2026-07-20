import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const t = await getTranslations();

  return (
    <main>
      <PageHeader
        texts={[
          {
            title: t('contact.pageTitle1'),
            lead: t('contact.pageLead1'),
          },
          {
            title: t('contact.pageTitle2'),
            lead: t('contact.pageLead2'),
          },
          {
            title: t('contact.pageTitle3'),
            lead: t('contact.pageLead3'),
          },
        ]}
        backgrounds={getHeroBackgrounds("contact")}
      />

      <Container className="py-14 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="stagger-children">
            <dl className="divide-y divide-border border-y border-border">
              <Reveal as="div" className="py-6 group">
                <dt className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=64&h=64&fit=crop&q=50" alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  </span>
                  {t('contact.office')}
                </dt>
                <dd className="mt-2 ml-11 text-sm leading-relaxed text-ink/85 transition-colors duration-200 group-hover:text-ink">
                  {t('contact.addressLine1')}
                  <br />
                  {t('contact.addressLine3')}
                </dd>
              </Reveal>
              <Reveal as="div" className="py-6 group">
                <dt className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    <img src="https://images.unsplash.com/photo-1553729459-afe8f2e0e21a?w=64&h=64&fit=crop&q=50" alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  </span>
                  {t('contact.phoneLabel')}
                </dt>
                <dd className="mt-2 ml-11 flex flex-col gap-1 text-sm">
                  <a href="tel:+23672696700" className="group/link inline-flex items-center gap-1 text-navy transition hover:text-red">
                    +236 72 69 67 00
                    <span className="inline-block h-3 w-3 opacity-0 transition-all duration-200 group-hover/link:opacity-100 group-hover/link:translate-x-0.5" aria-hidden="true">→</span>
                  </a>
                  <a href="tel:+23675343719" className="group/link inline-flex items-center gap-1 text-navy transition hover:text-red">
                    +236 75 34 37 19
                    <span className="inline-block h-3 w-3 opacity-0 transition-all duration-200 group-hover/link:opacity-100 group-hover/link:translate-x-0.5" aria-hidden="true">→</span>
                  </a>
                </dd>
              </Reveal>
              <Reveal as="div" className="py-6 group">
                <dt className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    <img src="https://images.unsplash.com/photo-1596526131083-e8c4e8c0f9f6?w=64&h=64&fit=crop&q=50" alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  </span>
                  {t('contact.emailLabel')}
                </dt>
                <dd className="mt-2 ml-11 text-sm">
                  <a href="mailto:cabinetcosi29@gmail.com" className="group/link inline-flex items-center gap-1 text-navy transition hover:text-red">
                    cabinetcosi29@gmail.com
                    <span className="inline-block opacity-0 transition-all duration-200 group-hover/link:opacity-100 group-hover/link:translate-x-0.5" aria-hidden="true">→</span>
                  </a>
                </dd>
              </Reveal>
              <Reveal as="div" className="py-6 group">
                <dt className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                    <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=64&h=64&fit=crop&q=50" alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  </span>
                  {t('contact.online')}
                </dt>
                <dd className="mt-1.5 flex flex-col gap-2 text-sm">
                  <a href="https://wa.me/23672696700" target="_blank" rel="noopener noreferrer" className="group/link inline-flex items-center gap-1 text-navy transition hover:text-red">
                    {t('contact.whatsapp')} — +236 72 69 67 00
                    <svg className="h-3 w-3 opacity-0 transition-all duration-200 group-hover/link:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H8M17 7V16"/></svg>
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=100054567694400" target="_blank" rel="noopener noreferrer" className="group/link inline-flex items-center gap-1 text-navy transition hover:text-red">
                    {t('contact.facebook')} — Cabinet Lewa Consulting Group
                    <svg className="h-3 w-3 opacity-0 transition-all duration-200 group-hover/link:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H8M17 7V16"/></svg>
                  </a>
                </dd>
              </Reveal>
            </dl>
          </div>

          <Reveal as="div" className="overflow-hidden rounded-lg border border-border shadow-xs transition-shadow duration-300 hover:shadow-md">
            <iframe
              title={t('contact.office')}
              className="h-full min-h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=Avenue%20des%20Martyrs%2C%20Bangui%2C%20Centrafrique&output=embed"
            />
          </Reveal>
        </div>

        {/* FAQ Contact */}
        <FAQSection
          title={t('contact.faqTitle')}
          image="https://images.unsplash.com/photo-1587560699334-bea93391dcef?w=600&q=80"
          imageAlt={t('contact.faqTitle')}
          items={[
            { q: t('contact.faqQ1'), r: t('contact.faqR1') },
            { q: t('contact.faqQ2'), r: t('contact.faqR2') },
            { q: t('contact.faqQ3'), r: t('contact.faqR3') },
            { q: t('contact.faqQ4'), r: t('contact.faqR4') },
          ]}
        />
      </Container>

      <CTASection page="contact" />
    </main>
  );
}
