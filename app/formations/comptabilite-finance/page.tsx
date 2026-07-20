import type { Metadata } from "next";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import FormationCards from "@/components/FormationCards";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import { comptaFinance } from "@/lib/formations";

export const metadata: Metadata = { title: "Comptabilité & finance" };

export default function ComptabiliteFinancePage() {
  return (
    <main>
      <PageHeader
        texts={[
          {
            title: "Comptabilité & finance",
            lead: "Comptabilité bancaire, SYCEBNL, Sage Compta, paie — des modules complets pour maîtriser la gestion comptable et financière.",
          },
          {
            title: "Des formateurs experts",
            lead: "Professionnels du chiffre et de la finance avec une expérience terrain au service de votre réussite.",
          },
          {
            title: "Certificat, attestation, CV",
            lead: "Chaque formation conclue par un certificat et un CV professionnel pour valoriser vos acquis.",
          },
        ]}
        backgrounds={getHeroBackgrounds("formations")}
      />

      <Container className="py-14 sm:py-16">
        <div className="mb-8">
          <h2 className="font-display text-2xl text-navy">
            Formations en comptabilité &amp; finance
          </h2>
          <p className="mt-2 text-sm text-muted max-w-lg">
            {comptaFinance.length} formation{comptaFinance.length > 1 ? "s" : ""} disponible
            {comptaFinance.length > 1 ? "s" : ""} pour vous professionnaliser dans les métiers
            de la comptabilité et de la finance.
          </p>
        </div>

        <FormationCards rows={comptaFinance} />

        <Reveal as="div" className="mt-12 border-t border-border pt-8 text-sm text-ink/70">
          <div className="flex items-start gap-3 rounded-lg bg-navy/[0.02] p-5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-semibold text-gold">
              i
            </span>
            <div>
              <p>
                Montant payable par tranche, chaque semaine. Formations flexibles, accessibles en
                semaine, le soir ou le week-end.
              </p>
              <p className="mt-2">
                Pour vous inscrire, contactez-nous au{" "}
                <a href="tel:+23672696700" className="group font-medium text-navy transition hover:text-red">
                  <span>+236 72 69 67 00</span>
                  <span className="block h-px max-w-0 bg-red transition-all duration-300 group-hover:max-w-full" />
                </a>{" "}
                ou via notre{" "}
                <a href="/contact" className="group font-medium text-navy transition hover:text-red">
                  <span>page de contact</span>
                  <span className="block h-px max-w-0 bg-red transition-all duration-300 group-hover:max-w-full" />
                </a>
                .
              </p>
            </div>
          </div>
        </Reveal>

        <FAQSection
          title="Foire aux questions"
          image="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80"
          imageAlt="Comptabilité et finance"
          items={[
            {
              q: "Comment s'inscrire à une formation ?",
              r: "Vous pouvez vous inscrire par téléphone au +236 72 69 67 00, par email à cabinetcosi29@gmail.com, ou via notre formulaire de contact en ligne. Un conseiller vous accompagnera dans le choix du module adapté à votre niveau et vos objectifs.",
            },
            {
              q: "Quels sont les modes de paiement ?",
              r: "Le règlement peut s'effectuer en espèces ou par tranches hebdomadaires. Nous proposons des facilités de paiement pour rendre nos formations accessibles au plus grand nombre. Contactez-nous pour discuter des modalités.",
            },
            {
              q: "Les formations sont-elles certifiantes ?",
              r: "Oui, chaque formation est conclue par la remise d'un certificat de participation et d'une attestation. Nous vous accompagnons également dans la rédaction de votre CV professionnel pour valoriser votre nouvelle compétence.",
            },
            {
              q: "Puis-je suivre une formation en soirée ou le week-end ?",
              r: "Absolument. Nos sessions sont flexibles et s'adaptent à votre disponibilité : en semaine, en soirée ou le week-end. Il vous suffit de nous indiquer vos créneaux préférentiels lors de l'inscription.",
            },
            {
              q: "Y a-t-il des prérequis pour s'inscrire ?",
              r: "La plupart de nos formations sont accessibles sans prérequis spécifiques. Pour les modules avancés (comme Sage Compta ou le SYCEBNL), une connaissance de base en comptabilité est recommandée. Notre équipe vous conseillera sur le parcours le plus adapté.",
            },
            {
              q: "Où se déroulent les formations ?",
              r: "Les formations ont lieu à notre siège : Avenue des Martyrs — SOCATEL, en face du Stade 20 000 Places, Bangui. Nous pouvons également organiser des sessions sur site pour les entreprises et organisations.",
            },
          ]}
        />
      </Container>

      <CTASection page="formations" />
    </main>
  );
}
