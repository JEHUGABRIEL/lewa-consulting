import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import BlurImage from "@/components/BlurImage";
import { getHeroBackgrounds } from "@/lib/heroBackgrounds";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { servicesData } from "@/lib/services";

export const metadata: Metadata = { title: "Services" };

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
    case "rh":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
    case "privee":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "juridique":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    default:
      return null;
  }
};

export default function ServicesPage() {
  return (
    <main>
      <PageHeader
        texts={[
          {
            title: "Audit, assistance, formation",
            lead: "Deux métiers, une même exigence : la rigueur du chiffre et la transmission du savoir-faire.",
          },
          {
            title: "Audit et contrôle interne",
            lead: "Une évaluation indépendante de vos comptes et de vos processus.",
          },
          {
            title: "Formations professionnelles",
            lead: "Des modules pratiques avec certificat, attestation et CV professionnel.",
          },
        ]}
        backgrounds={getHeroBackgrounds("services")}
      />

      <Container className="py-14 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {servicesData.map((s) => (
            <Link key={s.slug} href={`/services/${s.slug}`}>
              <Reveal as="div">
                <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white hover-lift">
                  {/* Image Unsplash en haut avec blur-up */}
                  <div className="relative h-36 w-full overflow-hidden rounded-t-xl">
                    <BlurImage
                      src={s.image}
                      alt={s.imageAlt}
                      className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    {/* Icone par-dessus l'image */}
                    <span className="absolute bottom-3 left-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-navy shadow-sm backdrop-blur-sm transition-colors duration-200 group-hover:bg-gold group-hover:text-navy">
                      {expertiseIcon(s.icon)}
                    </span>
                  </div>

                  {/* Contenu */}
                  <div className="flex flex-1 flex-col p-5 lg:p-7 pt-4 lg:pt-5">
                    <h2 className="font-display text-xl text-navy transition-colors duration-200 group-hover:text-red">{s.title}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-ink/70">{s.desc}</p>

                    {/* Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.tags.map((t) => (
                        <span key={t} className="inline-flex items-center rounded-full bg-navy/[0.06] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-navy/60">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Points */}
                    <ul className="mt-4 space-y-1.5 text-sm text-ink/80 border-t border-border pt-4 flex-1">
                      {s.points.slice(0, 3).map((p) => (
                        <li key={p} className="flex gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                          <span className="text-xs text-ink/75">{p}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted transition-colors duration-200 group-hover:text-gold">
                      <span>En savoir plus</span>
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink/70">
            Voir le détail des modules de formation et leurs tarifs.
          </p>
          <Link href="/formations/comptabilite-finance" className="group font-medium text-navy transition hover:text-red">
            <span>Consulter la grille tarifaire des formations</span>
            <span className="block h-px max-w-0 bg-red transition-all duration-300 group-hover:max-w-full" />
          </Link>
        </div>

        {/* FAQ Services */}
        <FAQSection
          title="Questions sur nos services"
          image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80"
          imageAlt="Consultation et conseil aux entreprises"
          items={[
            {
              q: "En quoi consiste une mission d'audit ?",
              r: "Une mission d'audit comptable et financier consiste à examiner les comptes et les processus internes d'une organisation pour s'assurer de leur fiabilité, de leur conformité et de leur efficacité. Nous remettons un rapport détaillé avec nos recommandations.",
            },
            {
              q: "Quelles sont les obligations fiscales pour une ONG en RCA ?",
              r: "Les ONG en RCA doivent tenir une comptabilité conforme au référentiel SYCEBNL, effectuer des déclarations fiscales (TVA, IRPP) et sociales (CNSS). Nous accompagnons les organisations dans toutes ces démarches.",
            },
            {
              q: "Proposez-vous un accompagnement ponctuel ou régulier ?",
              r: "Les deux formules sont possibles. Nous proposons des missions ponctuelles (audit, révision de comptes) ainsi qu'un accompagnement régulier (tenue de comptabilité mensuelle, déclarations périodiques).",
            },
            {
              q: "Quels sont les délais pour une mission d'audit ?",
              r: "La durée d'une mission d'audit dépend de la taille de l'organisation et de la complexité de ses opérations. En moyenne, une mission d'audit dure entre une et trois semaines.",
            },
          ]}
        />
      </Container>

      <CTASection page="services" />
    </main>
  );
}
