/**
 * Indique si un élément (formation, actualité…) a été ajouté ou modifié
 * récemment (par défaut : moins de 7 jours).
 *
 * À utiliser uniquement côté serveur (pages/ISR) : le calcul est fait une
 * fois lors du rendu SSR, ce qui garantit un rendu identique à l'hydratation
 * (pas de `Date.now()` dans un composant client).
 */
export function isRecentlyAdded(updatedAt?: string, days = 7): boolean {
  if (!updatedAt) return false;
  const at = Date.parse(updatedAt);
  if (Number.isNaN(at)) return false;
  return Date.now() - at < days * 24 * 60 * 60 * 1000;
}
