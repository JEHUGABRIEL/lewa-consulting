"use client";

import { useTranslations } from "next-intl";
import Loader from "@/components/Loader";

/**
 * État de chargement (fallback Suspense).
 *
 * ⚠ Composant CLIENT volontairement : il s'exécute pendant la génération
 * statique (la page serveur est asynchrone et suspend → le fallback est
 * rendu au build). Utiliser `getTranslations` (API serveur) ici sans
 * `setRequestLocale` ferait retomber next-intl sur `headers()` et
 * forcerait un rendu dynamique de TOUTES les routes. `useTranslations`
 * (côté client, via le provider du layout) ne touche pas au serveur.
 */
export default function Loading() {
  const t = useTranslations("common");
  return <Loader label={t("loading")} />;
}
