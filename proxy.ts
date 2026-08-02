import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

/**
 * Proxy (anciennement middleware — convention renommée dans Next.js 16).
 *
 * Rôle SEO :
 * - `/` → redirige vers `/fr` (locale par défaut, ou Accept-Language) ;
 * - `/services`, `/a-propos`, … → redirige vers `/{locale}/…` ;
 * - toutes les pages sont servies sous `/fr/…` et `/en/…`, ce qui permet
 *   un rendu statique par locale et un cache CDN complet.
 */
export default createMiddleware(routing);

export const config = {
  // Skip tous les chemins qui ne doivent pas être internationalisés
  // (API routes, assets statiques, Next.js internes).
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
