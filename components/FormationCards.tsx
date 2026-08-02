"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Reveal from "./Reveal";
import LevelBadge from "./LevelBadge";
import BlurImage from "./BlurImage";
import type { FormationRow } from "@/lib/formations";

// Clé i18n du libellé de la catégorie parente
const categoryTitleKey = (id: string) =>
  id === "compta" ? "formations.catComptaTitle" : "formations.catBureautiqueTitle";

export default function FormationCards({ rows }: { rows: FormationRow[] }) {
  const t = useTranslations();

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((r, i) => {
          const note = t(`formations.items.${r.slug}.note`);
          const desc = t(`formations.items.${r.slug}.desc`);
          return (
            <Reveal key={r.slug} as="div" delay={i * 60}>
              <Link
                href={`/formations/${r.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-white shadow-[0_1px_3px_rgba(12,35,64,0.06)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_18px_44px_rgba(12,35,64,0.10)]"
              >
                {/* Image */}
                <div className="relative h-40 w-full overflow-hidden">
                  <BlurImage
                    src={r.image}
                    alt={t(`formations.items.${r.slug}.imageAlt`)}
                    className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Voile dégradé pour la lisibilité du badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/45 via-navy-deep/5 to-transparent" />
                  {r.level && (
                    <div className="absolute bottom-2.5 right-2.5">
                      <LevelBadge level={r.level} />
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Eyebrow catégorie */}
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                    {t(categoryTitleKey(r.category))}
                  </span>

                  <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-navy transition-colors duration-200 group-hover:text-red">
                    {t(`formations.items.${r.slug}.name`)}
                  </h3>

                  {/* Note (durée / paiement) — si renseignée */}
                  {note && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
                      <svg className="h-3.5 w-3.5 shrink-0 text-navy/40 transition-colors duration-200 group-hover:text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {note}
                    </p>
                  )}

                  {/* Description */}
                  {desc && (
                    <p className="mt-2.5 text-xs leading-relaxed text-ink/60 line-clamp-3">
                      {desc}
                    </p>
                  )}

                  {/* Footer — tarif + CTA */}
                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/70 pt-4">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
                        {t('formations.priceLabel')}
                      </p>
                      <p className="mt-0.5 font-display text-xl font-semibold tabular text-navy">
                        {r.price}
                        <span className="ml-1 font-sans text-xs font-medium text-muted">FCFA</span>
                      </p>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-semibold text-navy shadow-sm transition-all duration-300 group-hover:bg-navy group-hover:text-paper group-hover:shadow-md">
                      {t('formations.btnInscrire')}
                      <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
