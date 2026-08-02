import { defineRouting } from "next-intl/routing";

/**
 * Configuration de routage international.
 *
 * - `localePrefix: "always"` → toutes les URLs portent le préfixe (`/fr`, `/en`),
 *   ce qui permet un rendu statique par locale et un cache CDN complet.
 * - `defaultLocale: "fr"` → `/` redirige vers `/fr` (via proxy.ts).
 */
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "always",
  // Désactive la détection par Accept-Language : `/` redirige TOUJOURS vers
  // `/fr` → cible canonique stable pour Google (pas deux URLs selon le
  // navigateur). Le sélecteur de langue reste disponible dans la navbar.
  localeDetection: false,
});
