/**
 * Centralisation des numéros de téléphone.
 *
 * La source de vérité est l'affichage défini dans les messages i18n :
 *   - common.phone  → "+236 72 69 67 00"
 *   - common.phone2 → "+236 75 34 37 19"
 *
 * Ces helpers dérivent les formes d'appel (tel:, wa.me) depuis l'affichage
 * pour éviter de dupliquer les numéros en dur dans les composants.
 * Un futur changement de numéro se fait donc uniquement dans messages/*.json.
 */

/** Convertit un affichage (« +236 72 69 67 00 ») en lien d'appel tel:. */
export function toTelHref(display: string): string {
  return `tel:${display.replace(/[^\d+]/g, "")}`;
}

/** Convertit un affichage en lien WhatsApp (chiffres seuls, sans « + » ni espaces). */
export function toWhatsAppHref(display: string): string {
  return `https://wa.me/${display.replace(/[^\d]/g, "")}`;
}
