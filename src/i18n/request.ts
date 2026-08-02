import { getRequestConfig } from "next-intl/server";
import { servicesData } from "@/lib/services";
import fr from "../../messages/fr.json";
import en from "../../messages/en.json";

/** Messages pré-chargés : imports statiques (pas d'`await import` à chaque requête). */
const messagesByLocale: Record<string, typeof fr> = { fr, en };

/**
 * Champs attendus par la page détail /services/[slug] pour chaque domaine.
 * ⚠ Liste partagée avec scripts/check-i18n.mjs : mettez à jour les deux
 * en même temps quand la page détail évolue.
 */
const SERVICE_ITEM_FIELDS = [
  "title",
  "short",
  "desc",
  "imageAlt",
  "tags",
  "details",
  "points",
];

/** Locales déjà signalées (anti-spam des logs en production). */
const reportedLocales = new Set<string>();

/**
 * Garde-fou : vérifie que les clés dynamiques services.items.* des messages
 * chargés se résolvent pour chaque slug de lib/services.ts.
 *
 * Détecte :
 *  - un cache de traduction périmé (serveur dev qui sert d'anciens messages,
 *    cf. erreurs MISSING_MESSAGE en cascade) ;
 *  - une traduction incomplète ou vide dans messages/fr.json ou en.json.
 *
 * En développement, on lève une erreur claire et actionnable au lieu de laisser
 * next-intl noyer la console de MISSING_MESSAGE. En production, on logge dans
 * les logs serveur sans faire tomber le site.
 */
function assertServiceItemsResolve(messages: unknown, locale: string) {
  const items = (messages as {
    services?: { items?: Record<string, Record<string, string>> };
  })?.services?.items;

  const missing: string[] = [];
  for (const s of servicesData) {
    for (const field of SERVICE_ITEM_FIELDS) {
      const value = items?.[s.slug]?.[field];
      if (typeof value !== "string" || value.trim() === "") {
        missing.push(`services.items.${s.slug}.${field}`);
      }
    }
  }

  if (missing.length > 0) {
    const sample =
      missing.slice(0, 4).join(", ") + (missing.length > 4 ? "…" : "");
    const message =
      `[i18n] ${missing.length} clé(s) services.items.* introuvable(s) ou vide(s) ` +
      `pour la locale « ${locale} » : ${sample}. Les messages chargés semblent ` +
      `périmés ou incomplets — arrêtez le serveur et relancez « npm run dev », ` +
      `ou purgez le dossier .next (rm -rf .next), puis vérifiez ` +
      `messages/fr.json et messages/en.json.`;
    if (process.env.NODE_ENV === "development") {
      throw new Error(message);
    }
    // En production : on logge une seule fois par locale pour ne pas
    // saturer les logs si le problème persiste sur chaque requête.
    if (!reportedLocales.has(locale)) {
      reportedLocales.add(locale);
      console.error(message);
    }
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  // La locale vient désormais de l'URL (/fr, /en) via le proxy —
  // plus aucun cookie : rendu statique par locale possible.
  let locale = (await requestLocale) as string | undefined;
  if (!locale || !messagesByLocale[locale]) {
    locale = "fr";
  }

  const messages = messagesByLocale[locale] ?? fr;

  assertServiceItemsResolve(messages, locale);

  return {
    locale,
    messages,
  };
});
