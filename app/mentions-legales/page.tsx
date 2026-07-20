import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";

export const metadata: Metadata = { title: "Mentions légales" };

export default async function MentionsLegalesPage() {
  const t = await getTranslations();

  return (
    <main>
      <PageHeader
        texts={[
          {
            title: t('legal.pageTitle'),
            lead: t('legal.pageLead'),
          },
        ]}
        backgrounds={getHeroBackgrounds("formations")}
      />

      <Container className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Éditeur du site */}
          <section>
            <h2 className="font-display text-xl text-navy">{t('legal.companyTitle')}</h2>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-ink/75">
              <p>
                <strong>{t('legal.companyName')}</strong>
              </p>
              <p>
                {t('legal.companyAddress')}
                <br />
                {t('legal.companyCity')}
              </p>
              <p>
                {t('common.phone')} :{" "}
                <a href="tel:+23672696700" className="text-navy underline transition hover:text-red">
                  +236 72 69 67 00
                </a>
              </p>
              <p>
                {t('common.email')} :{" "}
                <a href="mailto:cabinetcosi29@gmail.com" className="text-navy underline transition hover:text-red">
                  cabinetcosi29@gmail.com
                </a>
              </p>
            </div>
          </section>

          {/* Directeur de publication */}
          <section>
            <h2 className="font-display text-xl text-navy">{t('legal.directorTitle')}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">
              <strong>{t('legal.directorName')}</strong>, {t('legal.directorRole')}
            </p>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="font-display text-xl text-navy">{t('legal.hostTitle')}</h2>
            <p
              className="mt-4 text-sm leading-relaxed text-ink/75"
              dangerouslySetInnerHTML={{ __html: t('legal.hostText') }}
            />
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="font-display text-xl text-navy">{t('legal.intellectualTitle2')}</h2>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-ink/75">
              <p>{t('legal.intellectualDetail1')}</p>
              <p>{t('legal.intellectualDetail2')}</p>
            </div>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="font-display text-xl text-navy">{t('legal.liabilityTitle2')}</h2>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-ink/75">
              <p>{t('legal.liabilityDetail1')}</p>
              <p>{t('legal.liabilityDetail2')}</p>
            </div>
          </section>

          {/* Liens hypertextes */}
          <section>
            <h2 className="font-display text-xl text-navy">{t('legal.linksTitle')}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">{t('legal.linksText')}</p>
          </section>

          {/* Protection des données */}
          <section>
            <h2 className="font-display text-xl text-navy">{t('legal.privacyTitle2')}</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/75">
              <h3 className="font-semibold text-navy">{t('legal.dataCollectionTitle')}</h3>
              <p>{t('legal.dataCollectionText')}</p>

              <h3 className="font-semibold text-navy">{t('legal.dataUsageTitle')}</h3>
              <p>{t('legal.dataUsageText')}</p>

              <h3 className="font-semibold text-navy">{t('legal.dataRetentionTitle')}</h3>
              <p>{t('legal.dataRetentionText')}</p>

              <h3 className="font-semibold text-navy">{t('legal.dataRightsTitle')}</h3>
              <p>
                {t('legal.dataRightsText')} Pour exercer ces droits, veuillez nous contacter par email à{" "}
                <a
                  href="mailto:cabinetcosi29@gmail.com"
                  className="text-navy underline transition hover:text-red"
                >
                  cabinetcosi29@gmail.com
                </a>{" "}
                ou par courrier à notre adresse postale.
              </p>

              <h3 className="font-semibold text-navy">{t('legal.cookiesTitle2')}</h3>
              <p>{t('legal.cookiesDetail')}</p>

              <h3 className="font-semibold text-navy">{t('legal.securityTitle')}</h3>
              <p>{t('legal.securityText')}</p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-display text-xl text-navy">{t('legal.contactTitle')}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">{t('legal.contactText')}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-ink/75">
              <li>
                <strong>{t('common.email')} : </strong>
                <a
                  href="mailto:cabinetcosi29@gmail.com"
                  className="text-navy underline transition hover:text-red"
                >
                  cabinetcosi29@gmail.com
                </a>
              </li>
              <li>
                <strong>{t('common.phone')} : </strong>
                <a
                  href="tel:+23672696700"
                  className="text-navy underline transition hover:text-red"
                >
                  +236 72 69 67 00
                </a>
              </li>
              <li>
                <strong>{t('contact.address')} : </strong>{t('legal.companyAddress')}
              </li>
            </ul>
          </section>

          {/* Date de mise à jour */}
          <div className="border-t border-border pt-6 text-xs text-muted">
            <p>{t('legal.lastUpdate')}</p>
          </div>

          {/* Retour */}
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-navy transition hover:text-red"
            >
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>{t('common.backToHome')}</span>
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
