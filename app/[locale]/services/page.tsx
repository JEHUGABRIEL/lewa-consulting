import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import BlurImage from "@/components/BlurImage";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { getPublicServices } from "@/lib/admin/public";
import FAQJsonLd from "@/components/FAQJsonLd";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Metadata");
  const title = t("services");
  const description = t("servicesDescription");
  return {
    title,
    description,
    alternates: {
      canonical: `https://www.lewaconsultingroup.com/${locale}/services`,
      languages: {
        fr: "https://www.lewaconsultingroup.com/fr/services",
        en: "https://www.lewaconsultingroup.com/en/services",
        "x-default": "https://www.lewaconsultingroup.com/fr/services",
      },
    },
    openGraph: {
      type: "website",
      url: `https://www.lewaconsultingroup.com/${locale}/services`,
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
    case "formation":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M8 7h8" />
          <path d="M8 11h6" />
        </svg>
      );
    case "audit":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-9-9" />
          <polyline points="21 3 12 12 14 12 14 16 11 16" />
          <path d="M21 3h-4" />
        </svg>
      );
    case "briefcase":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "event":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <polyline points="9 15 11 17 15 13" />
        </svg>
      );
    default:
      return null;
  }
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const services = await getPublicServices();
  return (
    <main>
      <PageHeader
        texts={[
          {
            title: t('services.servicesPageTitle1'),
            lead: t('services.servicesPageLead1'),
          },
          {
            title: t('services.servicesPageTitle2'),
            lead: t('services.servicesPageLead2'),
          },
          {
            title: t('services.servicesPageTitle3'),
            lead: t('services.servicesPageLead3'),
          },
        ]}
        backgrounds={getHeroBackgrounds("services")}
      />

      <Container className="py-14 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {services.map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`}>
              <Reveal as="div">
                <div className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm hover-lift">
                  { }
                  <div className="relative h-36 w-full overflow-hidden rounded-t-xl">
                    <BlurImage
                      src={s.image}
                      alt={t(`services.items.${s.slug}.imageAlt`)}
                      className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    { }
                    <span className="absolute bottom-3 left-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-navy shadow-sm backdrop-blur-sm transition-colors duration-200 group-hover:bg-gold group-hover:text-navy">
                      {expertiseIcon(s.icon)}
                    </span>
                  </div>

                  { }
                  <div className="flex flex-1 flex-col p-5 lg:p-7 pt-4 lg:pt-5">
                    <h2 className="font-display text-xl text-navy transition-colors duration-200 group-hover:text-red">{t(`services.items.${s.slug}.title`)}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-ink/70">{t(`services.items.${s.slug}.desc`)}</p>

                    { }
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {t(`services.items.${s.slug}.tags`).split("\n").map((tag) => (
                        <span key={tag} className="inline-flex items-center rounded-full bg-navy/[0.06] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-navy/60">
                          {tag}
                        </span>
                      ))}
                    </div>

                    { }
                    <ul className="mt-4 space-y-1.5 text-sm text-ink/80 border-t border-border pt-4 flex-1">
                      {t(`services.items.${s.slug}.points`).split("\n").slice(0, 3).map((p) => (
                        <li key={p} className="flex gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                          <span className="text-xs text-ink/75">{p}</span>
                        </li>
                      ))}
                    </ul>

                    { }
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted transition-colors duration-200 group-hover:text-gold">
                      <span>{t('common.learnMore')}</span>
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink/70">
            {t('services.servicesPageSeeDetail')}
          </p>
          <Link href="/formations" className="group font-medium text-navy transition hover:text-red">
            <span>{t('services.servicesPagePricing')}</span>
            <span className="block h-px max-w-0 bg-red transition-all duration-300 group-hover:max-w-full" />
          </Link>
        </div>

        { }
        <FAQJsonLd
          items={[
            { q: t('services.faqQ1'), r: t('services.faqR1') },
            { q: t('services.faqQ2'), r: t('services.faqR2') },
            { q: t('services.faqQ3'), r: t('services.faqR3') },
            { q: t('services.faqQ4'), r: t('services.faqR4') },
          ]}
        />
        <FAQSection
          title={t('services.servicesPageFaqTitle')}
          image="https://res.cloudinary.com/dwmrzp61c/image/upload/comptabilite/reunion-internationale.avif"
          imageAlt={t('services.faqImageAlt')}
          items={[
            { q: t('services.faqQ1'), r: t('services.faqR1') },
            { q: t('services.faqQ2'), r: t('services.faqR2') },
            { q: t('services.faqQ3'), r: t('services.faqR3') },
            { q: t('services.faqQ4'), r: t('services.faqR4') },
          ]}
        />
      </Container>

      <CTASection page="services" />
    </main>
  );
}
