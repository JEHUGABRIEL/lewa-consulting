"use client";

import { useTranslations } from "next-intl";

export default function LevelLegend() {
  const t = useTranslations();

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border-t border-border pt-4 text-[11px] text-muted">
      <span className="inline-flex items-center gap-1.5">
        <svg className="h-2.5 w-2.5 text-green" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="8" cy="8" r="7" />
        </svg>
        {t('formations.debutant')}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <svg className="h-2.5 w-2.5 text-yellow" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="8" cy="8" r="7" />
        </svg>
        {t('formations.intermediaire')}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <svg className="h-2.5 w-2.5 text-red" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="8" cy="8" r="7" />
        </svg>
        {t('formations.avance')}
      </span>
    </div>
  );
}
