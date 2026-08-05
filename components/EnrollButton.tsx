"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import EnrollmentModal from "./EnrollmentModal";

export default function EnrollButton({
  formationSlug,
  formationName,
  alternatives = [],
  className = "",
}: {
  formationSlug: string;
  formationName: string;
  alternatives?: { slug: string; name: string }[];
  className?: string;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-full bg-gold-bright px-6 py-3 font-display text-sm font-semibold text-navy transition-all duration-300 hover:bg-gold hover:-translate-y-0.5 hover:shadow-lg ${className}`}
      >
        {t("formations.btnInscrire")}
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>

      <EnrollmentModal
        open={open}
        onClose={() => setOpen(false)}
        formations={[
          { slug: formationSlug, name: formationName },
          ...alternatives,
        ]}
        initialSlug={formationSlug}
      />
    </>
  );
}
