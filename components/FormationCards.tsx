"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Reveal from "./Reveal";
import LevelBadge from "./LevelBadge";
import LevelLegend from "./LevelLegend";
import BlurImage from "./BlurImage";
import type { FormationRow } from "@/lib/formations";

export default function FormationCards({ rows }: { rows: FormationRow[] }) {
  const t = useTranslations();

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((r, i) => (
          <Reveal key={r.slug} as="div" delay={i * 60}>
            <Link href={`/formations/${r.slug}`}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white hover-lift">
                {/* Image Unsplash en haut */}
                <div className="relative h-32 w-full overflow-hidden">
                  <BlurImage
                    src={r.image}
                    alt={t(`formations.items.${r.slug}.imageAlt`)}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {r.level && (
                    <div className="absolute bottom-2 right-2">
                      <LevelBadge level={r.level} />
                    </div>
                  )}
                </div>
                {/* Contenu */}
                <div className="flex flex-1 flex-col p-4 lg:p-5">
                  <span className="inline-block h-1 w-8 shrink-0 rounded-full bg-gradient-to-r from-gold to-gold-bright" />

                  <h3 className="mt-3 font-display text-base font-semibold text-navy transition-colors duration-200 group-hover:text-red">
                    {t(`formations.items.${r.slug}.name`)}
                  </h3>

                  {(() => {
                    const note = t(`formations.items.${r.slug}.note`);
                    return note ? (
                      <p className="mt-1.5 text-xs leading-relaxed text-muted flex-1">
                        {note}
                      </p>
                    ) : (
                      <div className="flex-1" />
                    );
                  })()}

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <span className="inline-block rounded-full bg-gold/10 px-3 py-1 font-mono text-xs font-semibold text-navy tabular tracking-wide">
                      {r.price} FCFA
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors duration-200 group-hover:text-gold">
                      {t('formations.btnInscrire')} &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>

      <LevelLegend />
    </>
  );
}
