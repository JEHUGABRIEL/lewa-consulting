












// Indicatifs pays proposés dans le formulaire d'inscription (et utilisés pour
// normaliser les numéros au format E.164, requis par l'API WhatsApp Business).
export const PHONE_COUNTRY_CODES = [
  { value: "+236", label: "+236 — République centrafricaine" },
  { value: "+235", label: "+235 — Tchad" },
  { value: "+237", label: "+237 — Cameroun" },
  { value: "+241", label: "+241 — Gabon" },
  { value: "+240", label: "+240 — Guinée équatoriale" },
  { value: "+242", label: "+242 — République du Congo" },
  { value: "+243", label: "+243 — RD Congo" },
  { value: "+221", label: "+221 — Sénégal" },
  { value: "+225", label: "+225 — Côte d'Ivoire" },
  { value: "+228", label: "+228 — Togo" },
  { value: "+229", label: "+229 — Bénin" },
  { value: "+223", label: "+223 — Mali" },
  { value: "+224", label: "+224 — Guinée" },
  { value: "+226", label: "+226 — Burkina Faso" },
  { value: "+227", label: "+227 — Niger" },
  { value: "+234", label: "+234 — Nigeria" },
  { value: "+33", label: "+33 — France" },
];

// Indicatif présélectionné (République centrafricaine — clientèle principale).
export const DEFAULT_PHONE_COUNTRY = "+236";

export function toTelHref(display: string): string {
  return `tel:${display.replace(/[^\d+]/g, "")}`;
}


export function toWhatsAppHref(display: string): string {
  return `https://wa.me/${display.replace(/[^\d]/g, "")}`;
}



// Normalise un numéro en E.164 (chiffres uniquement, indicatif compris) pour
// l'API WhatsApp Business. Un numéro déjà international (préfixé « + » ou
// « 00 ») est conservé tel quel ; sinon l'indicatif du pays est préfixé.
export function toE164(phone: string, countryCode?: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const compact = phone.replace(/[\s.\-()]/g, "");
  if (compact.startsWith("+") || compact.startsWith("00")) {
    return digits;
  }
  const cc = (countryCode || DEFAULT_PHONE_COUNTRY).replace(/\D/g, "");
  return cc ? cc + digits : digits;
}

// Affichage lisible : « +236 72 69 67 00 » quand le pays est connu, sinon le
// numéro saisi (qui peut déjà contenir son indicatif).
export function formatPhoneDisplay(phone: string, countryCode?: string): string {
  const p = phone.trim();
  if (!p) return "";
  if (p.startsWith("+")) return p;
  const cc = (countryCode || "").trim();
  return cc ? `${cc} ${p}` : p;
}


export function toEnrollmentWhatsAppHref(
  phone: string,
  input: { name: string; formation: string },
  countryCode?: string,
): string {
  const message = `Bonjour ${input.name}, votre demande d'inscription à la formation « ${input.formation} » a bien été reçue par le Cabinet COSI LEWA Consulting. Notre équipe vous recontactera rapidement pour finaliser l'inscription. Merci !`;
  const target = toE164(phone, countryCode) ?? phone;
  return `${toWhatsAppHref(target)}?text=${encodeURIComponent(message)}`;
}
