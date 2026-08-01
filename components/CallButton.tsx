import { getTranslations } from "next-intl/server";

export default async function CallButton() {
  const t = await getTranslations("common");

  return (
    <a
      href="tel:+23672696700"
      aria-label={`${t("callUs")} — ${t("phone")}`}
      className="group fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gold-bright shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
    >
      {/* Halo pulsant */}
      <span
        className="absolute inset-0 -z-10 animate-ping-slow rounded-full bg-gold-bright/40"
        aria-hidden="true"
      />
      {/* Icône téléphone */}
      <svg
        className="h-6 w-6 text-navy"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>

      {/* Infobulle avec le numéro */}
      <span
        className="pointer-events-none absolute left-full ml-3 -translate-x-1 whitespace-nowrap rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
        aria-hidden="true"
      >
        {t("phone")}
      </span>
    </a>
  );
}
