"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "@/components/Container";










export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main className="flex min-h-[70vh] items-center">
      <Container className="py-20 text-center">
        <p className="font-display text-[6rem] font-bold leading-none text-gold/15 sm:text-[8rem]">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl text-navy sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          {t("text")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gold-bright px-6 py-3 font-display text-sm font-semibold text-navy transition-all duration-300 hover:bg-gold hover:-translate-y-0.5 hover:shadow-lg"
          >
            {t("homeLink")}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-navy/25 px-6 py-3 text-sm font-medium text-navy transition-all duration-300 hover:border-navy hover:bg-navy/[0.04]"
          >
            {t("contactLink")}
          </Link>
        </div>
      </Container>
    </main>
  );
}
