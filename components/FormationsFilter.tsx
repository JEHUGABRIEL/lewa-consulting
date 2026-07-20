"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Reveal from "./Reveal";
import LevelBadge from "./LevelBadge";
import LevelLegend from "./LevelLegend";
import BlurImage from "./BlurImage";
import type { FormationRow, Level } from "@/lib/formations";

type Category = {
  id: string;
  label: string;
  rows: FormationRow[];
};

const levelOptions: { value: Level; labelKey: string; circle: string }[] = [
  { value: "debutant", labelKey: "formations.debutant", circle: "text-green" },
  { value: "intermediaire", labelKey: "formations.intermediaire", circle: "text-yellow" },
  { value: "avance", labelKey: "formations.avance", circle: "text-red" },
];

export default function FormationsFilter({
  categories,
  initialActive,
}: {
  categories: Category[];
  initialActive?: string;
}) {
  const t = useTranslations();
  const defaultCat = categories.some((c) => c.id === initialActive) ? initialActive : "all";
  const [activeCat, setActiveCat] = useState(defaultCat);
  const [activeLevel, setActiveLevel] = useState<string>("all");

  const allRows = categories.flatMap((c) => c.rows);

  // Filtrer par catégorie
  const catFiltered =
    activeCat === "all"
      ? allRows
      : categories.find((c) => c.id === activeCat)?.rows ?? [];

  // Filtrer par niveau
  const displayed =
    activeLevel === "all"
      ? catFiltered
      : catFiltered.filter((r) => r.level === activeLevel);

  const activeBtn = "bg-navy text-paper border-navy";
  const inactiveBtn =
    "bg-white text-ink/70 border-border hover:border-navy/30 hover:text-navy";

  const levelLabel = (level: string) => {
    const opt = levelOptions.find((l) => l.value === level);
    return opt ? t(opt.labelKey) : "";
  };

  return (
    <div>
      {/* Filtres par catégorie */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
          {t('formations.category') || "Catégorie"}
        </span>
        <button
          onClick={() => setActiveCat("all")}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
            activeCat === "all" ? activeBtn : inactiveBtn
          }`}
        >
          {t('formations.all') || "Toutes"}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
              activeCat === c.id ? activeBtn : inactiveBtn
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Filtres par niveau */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
          {t('formations.level') || "Niveau"}
        </span>
        <button
          onClick={() => setActiveLevel("all")}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
            activeLevel === "all" ? activeBtn : inactiveBtn
          }`}
        >
          {t('formations.allLevels') || "Tous"}
        </button>
        {levelOptions.map((l) => (
          <button
            key={l.value}
            onClick={() => setActiveLevel(l.value)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
              activeLevel === l.value ? activeBtn : inactiveBtn
            }`}
          >
            <svg
              className={`h-2.5 w-2.5 shrink-0 ${l.circle}`}
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="7" />
            </svg>
            {t(l.labelKey)}
          </button>
        ))}
      </div>

      {/* Separator */}
      <hr className="my-6 border-border" />

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayed.map((r, i) => (
          <Reveal key={r.name} as="div" delay={i * 60}>
            <Link href={`/formations/${r.slug}`}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-white hover-lift">
                {/* Image Unsplash en haut */}
                <div className="relative h-32 w-full overflow-hidden">
                  <BlurImage
                    src={r.image}
                    alt={r.imageAlt}
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
                    {r.name}
                  </h3>

                  {r.note && (
                    <p className="mt-1.5 text-xs leading-relaxed text-muted flex-1">
                      {r.note}
                    </p>
                  )}
                  {!r.note && <div className="flex-1" />}

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

      {/* Results count */}
      <p className="mt-6 text-center text-xs text-muted">
        {t('formations.resultsCount', { count: displayed.length })}
        {activeCat !== "all" &&
          ` · ${categories.find((c) => c.id === activeCat)?.label.toLowerCase()}`}
        {activeLevel !== "all" && (
          <>
            {" · "}
            <span className="inline-flex items-center gap-1">
              <svg
                className={`h-2 w-2 ${
                  activeLevel === "debutant"
                    ? "text-green"
                    : activeLevel === "intermediaire"
                      ? "text-yellow"
                      : "text-red"
                }`}
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <circle cx="8" cy="8" r="7" />
              </svg>
              {levelLabel(activeLevel)}
            </span>
          </>
        )}
      </p>

      <LevelLegend />
    </div>
  );
}
