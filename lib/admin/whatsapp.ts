import { toE164 } from "@/lib/phone";

// WhatsApp Business Cloud API (Meta) — rappels automatiques J-48h.
// Documentation : https://developers.facebook.com/docs/whatsapp/cloud-api
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";
// Nom du template approuvé par Meta. Contrat : 3 variables — {{1}} nom du
// demandeur, {{2}} formation, {{3}} date/heure de début de session.
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "rappel_formation";
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "fr";

export function whatsappConfigured(): boolean {
  return Boolean(ACCESS_TOKEN && PHONE_NUMBER_ID);
}

export type WhatsAppResult = {
  delivered: boolean;
  preview?: { to: string; template: string; vars: string[] };
};

/**
 * Envoie le template de rappel J-48h via la Cloud API. Sans configuration
 * (variables d'env absentes), l'envoi est simulé : un aperçu est journalisé et
 * `delivered: false` est renvoyé — le rappel bascule alors sur l'email.
 */
export async function sendWhatsAppReminder(
  to: string,
  input: { name: string; formation: string; startDate: string },
): Promise<WhatsAppResult> {
  const formatted = new Date(input.startDate).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const vars = [input.name, input.formation, formatted];

  if (!whatsappConfigured()) {
    console.log(
      "[admin-whatsapp] WhatsApp non configuré — message NON envoyé. Aperçu du template :",
      JSON.stringify({ to, template: TEMPLATE_NAME, vars }, null, 2),
    );
    return { delivered: false, preview: { to, template: TEMPLATE_NAME, vars } };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${ACCESS_TOKEN}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: TEMPLATE_NAME,
            language: { code: TEMPLATE_LANG },
            components: [
              {
                type: "body",
                parameters: vars.map((text) => ({ type: "text", text })),
              },
            ],
          },
        }),
        signal: AbortSignal.timeout(15_000),
      },
    );
    const data = (await res.json().catch(() => null)) as {
      messages?: { id?: string }[];
      error?: { message?: string };
    } | null;
    if (res.ok && Array.isArray(data?.messages) && data.messages.length > 0) {
      return { delivered: true };
    }
    console.error(
      "[admin-whatsapp] Message refusé par Meta :",
      JSON.stringify(data?.error ?? data),
    );
    return { delivered: false };
  } catch (err) {
    console.error("[admin-whatsapp] Échec de l'envoi WhatsApp :", err);
    return { delivered: false };
  }
}

// Ré-export : normalisation E.164 partagée avec le dashboard (liens wa.me).
export { toE164 };
