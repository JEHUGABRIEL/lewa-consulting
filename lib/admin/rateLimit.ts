import { consumeFixedWindow, resetKey, type RateLimitResult } from "./rateStore";

// Limite de débit à fenêtre fixe (flux OTP : génération et vérification).
//
// L'implémentation réelle vit désormais dans `rateStore.ts` : compteurs
// partagés via Supabase (persistants et synchronisés entre instances), avec
// repli fichier en dev local. Ce module conserve l'API historique
// (`consumeRateLimit`, `resetRateLimit`) pour ne pas toucher aux appelants.

export type { RateLimitResult };

// Incrémente le compteur de `key` dans une fenêtre de `windowMs`. Retourne
// `allowed: false` (avec le temps d'attente restant) dès que `max` est atteint.
export function consumeRateLimit(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  return consumeFixedWindow(key, max, windowMs);
}

// Efface le compteur d'une clé (ex. après une vérification réussie).
export function resetRateLimit(key: string): Promise<void> {
  return resetKey(key);
}
