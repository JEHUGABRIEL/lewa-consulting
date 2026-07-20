"use client";

import { useTranslations } from "next-intl";
import type { Level } from "@/lib/formations";

const config: Record<
  Level,
  { labelKey: string; circleColor: string; bg: string; text: string; tooltipKey: string }
> = {
  debutant: {
    labelKey: "formations.debutant",
    circleColor: "text-green",
    bg: "bg-green/[0.08]",
    text: "text-green",
    tooltipKey: "formations.levelInfoDebutant",
  },
  intermediaire: {
    labelKey: "formations.intermediaire",
    circleColor: "text-yellow",
    bg: "bg-yellow/[0.08]",
    text: "text-yellow",
    tooltipKey: "formations.levelInfoIntermediaire",
  },
  avance: {
    labelKey: "formations.avance",
    circleColor: "text-red",
    bg: "bg-red/[0.08]",
    text: "text-red",
    tooltipKey: "formations.levelInfoAvance",
  },
};

export default function LevelBadge({ level }: { level: Level }) {
  const t = useTranslations();
  const c = config[level];
  return (
    <span className="group relative inline-flex">
      {/* Badge */}
      <span
        className={`inline-flex items-center gap-1.5 rounded-full ${c.bg} ${c.text} px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider cursor-default`}
      >
        <svg
          className={`h-3.5 w-3.5 shrink-0 ${c.circleColor}`}
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="8" cy="8" r="6.5" />
        </svg>
        {t(c.labelKey)}
      </span>

      {/* Tooltip */}
      <span
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-200 delay-150 group-hover:translate-y-0 group-hover:opacity-100"
        role="tooltip"
      >
        <span className="block whitespace-nowrap rounded-lg bg-navy-deep px-3 py-1.5 text-[11px] font-normal leading-snug text-paper shadow-lg normal-case tracking-normal">
          {t(c.tooltipKey)}
        </span>
        {/* Flèche */}
        <span
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-navy-deep"
          aria-hidden="true"
        />
      </span>
    </span>
  );
}


