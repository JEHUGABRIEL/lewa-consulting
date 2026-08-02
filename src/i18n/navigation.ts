import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Helpers de navigation sensibles à la locale :
 * - `Link` préfixe automatiquement les hrefs internes (`/a-propos` → `/fr/a-propos`) ;
 * - `useRouter` / `usePathname` travaillent sur le pathname SANS préfixe de locale,
 *   ce qui permet au sélecteur de langue de conserver la page courante.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
