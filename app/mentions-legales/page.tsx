import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <main>
      <PageHeader
        texts={[
          {
            title: "Mentions légales",
            lead: "Informations légales et politique de confidentialité du Cabinet COSI Lewa-Consulting Group.",
          },
        ]}
        backgrounds={getHeroBackgrounds("formations")}
      />

      <Container className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Éditeur du site */}
          <section>
            <h2 className="font-display text-xl text-navy">Éditeur du site</h2>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-ink/75">
              <p>
                <strong>Cabinet COSI Lewa-Consulting Group</strong>
              </p>
              <p>
                Avenue des Martyrs — SOCATEL, en face du Stade 20 000 Places
                <br />
                Bangui, République Centrafricaine
              </p>
              <p>
                Téléphone :{" "}
                <a href="tel:+23672696700" className="text-navy underline transition hover:text-red">
                  +236 72 69 67 00
                </a>
              </p>
              <p>
                Email :{" "}
                <a href="mailto:cabinetcosi29@gmail.com" className="text-navy underline transition hover:text-red">
                  cabinetcosi29@gmail.com
                </a>
              </p>
            </div>
          </section>

          {/* Directeur de publication */}
          <section>
            <h2 className="font-display text-xl text-navy">Directeur de la publication</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">
              <strong>Marie-Claire Ngbokoli</strong>, Présidente Fondatrice du Cabinet COSI
              Lewa-Consulting Group.
            </p>
          </section>

          {/* Hébergement */}
          <section>
            <h2 className="font-display text-xl text-navy">Hébergement</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">
              Le site{" "}
              <a
                href="https://www.lewa-consulting.com"
                className="text-navy underline transition hover:text-red"
              >
                lewa-consulting.com
              </a>{" "}
              est hébergé par <strong>Vercel Inc.</strong>
              <br />
              340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
            </p>
          </section>

          {/* Propriété intellectuelle */}
          <section>
            <h2 className="font-display text-xl text-navy">Propriété intellectuelle</h2>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-ink/75">
              <p>
                L&rsquo;ensemble du contenu du site (textes, logos, images, vidéos, icônes,
                charte graphique) est la propriété exclusive du Cabinet COSI Lewa-Consulting
                Group, sauf mention contraire.
              </p>
              <p>
                Toute reproduction, distribution, modification, adaptation, publication ou
                transmission du contenu, même partielle, est strictement interdite sans
                l&rsquo;autorisation écrite préalable du cabinet.
              </p>
            </div>
          </section>

          {/* Responsabilité */}
          <section>
            <h2 className="font-display text-xl text-navy">Limitation de responsabilité</h2>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-ink/75">
              <p>
                Le Cabinet COSI Lewa-Consulting Group s&rsquo;efforce d&rsquo;assurer
                l&rsquo;exactitude et la mise à jour des informations diffusées sur ce site.
                Toutefois, le cabinet ne saurait garantir l&rsquo;exhaustivité, l&rsquo;exactitude
                ou l&rsquo;actualité des informations fournies.
              </p>
              <p>
                Le cabinet décline toute responsabilité en cas de dommage direct ou indirect
                résultant de l&rsquo;accès ou de l&rsquo;utilisation du site, y compris
                l&rsquo;indisponibilité du site, une perte de données ou un préjudice
                matériel ou immatériel.
              </p>
            </div>
          </section>

          {/* Liens hypertextes */}
          <section>
            <h2 className="font-display text-xl text-navy">Liens hypertextes</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">
              Le site peut contenir des liens vers des sites tiers. Le Cabinet COSI
              Lewa-Consulting Group n&rsquo;exerce aucun contrôle sur le contenu de ces sites
              et décline toute responsabilité quant à leur contenu, leurs pratiques en matière
              de protection des données ou leur disponibilité.
            </p>
          </section>

          {/* Protection des données */}
          <section>
            <h2 className="font-display text-xl text-navy">
              Politique de confidentialité &amp; protection des données
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink/75">
              <h3 className="font-semibold text-navy">Collecte des données</h3>
              <p>
                Le Cabinet COSI Lewa-Consulting Group collecte les informations personnelles
                que vous nous fournissez volontairement via notre formulaire de contact, par
                téléphone ou par email : nom, prénom, adresse email, numéro de téléphone,
                structure, et tout message que vous nous adressez.
              </p>

              <h3 className="font-semibold text-navy">Utilisation des données</h3>
              <p>
                Les données collectées sont utilisées uniquement dans le cadre de la relation
                commerciale et pédagogique avec nos clients, partenaires et apprenants :
                traitement des demandes de renseignement, gestion des inscriptions aux
                formations, suivi des missions d&rsquo;audit et d&rsquo;assistance comptable,
                et envoi d&rsquo;informations relatives à nos activités.
              </p>

              <h3 className="font-semibold text-navy">Conservation des données</h3>
              <p>
                Vos données personnelles sont conservées pour une durée n&rsquo;excédant pas
                celle nécessaire aux finalités pour lesquelles elles ont été collectées,
                conformément à la réglementation en vigueur en République Centrafricaine.
              </p>

              <h3 className="font-semibold text-navy">Droits des utilisateurs</h3>
              <p>
                Conformément à la réglementation applicable, vous disposez d&rsquo;un droit
                d&rsquo;accès, de rectification, d&rsquo;effacement et de limitation du
                traitement de vos données personnelles. Pour exercer ces droits, veuillez
                nous contacter par email à{" "}
                <a
                  href="mailto:cabinetcosi29@gmail.com"
                  className="text-navy underline transition hover:text-red"
                >
                  cabinetcosi29@gmail.com
                </a>{" "}
                ou par courrier à notre adresse postale.
              </p>

              <h3 className="font-semibold text-navy">Cookies</h3>
              <p>
                Ce site n&rsquo;utilise pas de cookies de traçage ou de publicité. Des cookies
                techniques strictement nécessaires au fonctionnement du site peuvent être
                utilisés. Aucune donnée personnelle n&rsquo;est collectée via des cookies sans
                votre consentement explicite.
              </p>

              <h3 className="font-semibold text-navy">Sécurité</h3>
              <p>
                Le Cabinet COSI Lewa-Consulting Group met en œuvre toutes les mesures
                techniques et organisationnelles appropriées pour garantir la sécurité et la
                confidentialité de vos données personnelles.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-display text-xl text-navy">Contact</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/75">
              Pour toute question relative aux mentions légales ou à la protection des
              données, vous pouvez nous contacter :
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-ink/75">
              <li>
                <strong>Email : </strong>
                <a
                  href="mailto:cabinetcosi29@gmail.com"
                  className="text-navy underline transition hover:text-red"
                >
                  cabinetcosi29@gmail.com
                </a>
              </li>
              <li>
                <strong>Téléphone : </strong>
                <a
                  href="tel:+23672696700"
                  className="text-navy underline transition hover:text-red"
                >
                  +236 72 69 67 00
                </a>
              </li>
              <li>
                <strong>Adresse : </strong>Avenue des Martyrs — SOCATEL, Bangui, RCA
              </li>
            </ul>
          </section>

          {/* Date de mise à jour */}
          <div className="border-t border-border pt-6 text-xs text-muted">
            <p>Dernière mise à jour : juillet 2026</p>
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
              <span>Retour à l&rsquo;accueil</span>
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
