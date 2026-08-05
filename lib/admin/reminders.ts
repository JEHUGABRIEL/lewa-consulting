import {
  appendActivityEvent,
  makeActivityEvent,
  type ActivityInput,
} from "./activity";
import { emailConfigured, sendEnrollmentReminderEmail } from "./email";
import { invalidateStoreCache } from "./public";
import { readStore, writeStore } from "./store";
import { sendWhatsAppReminder, whatsappConfigured, toE164 } from "./whatsapp";
import type { ActivityEvent, EnrollmentRequest } from "./constants";

// Le rappel part dans les 48 h précédant le début de la session.
export const REMINDER_WINDOW_MS = 48 * 60 * 60 * 1000;

export type ReminderResult = {
  ok: boolean;
  checked: number;
  due: number;
  sent: number;
  failed: number;
  skippedNoEmail: number;
  // `subject` : exposé uniquement en mode démo (pas de clé Resend) — permet de
  // vérifier en E2E que le modèle personnalisé du dashboard est bien utilisé.
  // `channel` : canal utilisé pour l'envoi (« whatsapp » prioritaire, sinon
  // « email » en secours).
  details: {
    id: string;
    name: string;
    sent: boolean;
    subject?: string;
    channel?: "whatsapp" | "email";
  }[];
};

/**
 * Parcourt les demandes confirmées avec une date de début :
 * - fenêtre : début - 48 h <= maintenant < début (le rappel ne part jamais après le début) ;
 * - anti-doublon : `reminderSentAt` absent ;
 * - canal prioritaire : WhatsApp Business (si configuré et numéro E.164
 *   dérivable) ; sinon email ; sans aucun canal : ignoré (compté) ;
 * - l'envoi est best-effort (jamais bloquant) ; on marque `reminderSentAt`
 *   uniquement si un canal a délivré (retentative au prochain passage sinon).
 */
export async function processDueReminders(
  now: Date = new Date(),
): Promise<ReminderResult> {
  const store = await readStore();
  const enrollments = store.enrollments ?? [];
  const nowMs = now.getTime();

  const candidates = enrollments.filter(
    (e): e is EnrollmentRequest & { startDate: string } =>
      e.status === "confirmed" &&
      Boolean(e.startDate) &&
      !e.reminderSentAt &&
      // Jamais de rappel pour une demande passée à la corbeille (soft delete).
      !e.deletedAt,
  );

  const due = candidates.filter((e) => {
    const start = new Date(e.startDate).getTime();
    return start - REMINDER_WINDOW_MS <= nowMs && nowMs < start;
  });

  const details: ReminderResult["details"] = [];
  const updated = new Map<string, EnrollmentRequest>();
  const activityInputs: ActivityInput[] = [];
  let sent = 0;
  let failed = 0;
  let skippedNoEmail = 0;

  for (const e of due) {
    const waNumber = toE164(e.phone, e.countryCode);
    const waPossible = whatsappConfigured() && Boolean(waNumber);
    const emailPossible = Boolean(e.email);

    // Aucun canal disponible : ni WhatsApp (non configuré / numéro inexploitable),
    // ni email renseigné.
    if (!waPossible && !emailPossible) {
      skippedNoEmail++;
      details.push({ id: e.id, name: e.name, sent: false });
      continue;
    }

    let delivered = false;
    let channel: "whatsapp" | "email" | undefined;
    let previewSubject: string | undefined;

    // 1) WhatsApp d'abord — uniquement si configuré (l'envoi est réel : un
    // template approuvé est requis côté Meta ; en cas de refus, repli email).
    if (waPossible) {
      const wa = await sendWhatsAppReminder(waNumber as string, {
        name: e.name,
        formation: e.formation,
        startDate: e.startDate,
      });
      if (wa.delivered) {
        delivered = true;
        channel = "whatsapp";
      }
    }

    // 2) Email en secours (comportement historique).
    if (!delivered && emailPossible) {
      const result = await sendEnrollmentReminderEmail(e.email as string, {
        name: e.name,
        formation: e.formation,
        startDate: e.startDate,
      });
      // « Livré » = délivré par Resend, ou mode démo (pas de clé) : dans ce cas
      // on marque quand même pour éviter de retenter à chaque passage de cron.
      // En cas d'échec réel (Resend configuré), on ne marque pas : retentative.
      if (result.delivered || !emailConfigured()) {
        delivered = true;
        channel = "email";
        previewSubject = result.preview?.subject;
      }
    }

    if (delivered && channel) {
      sent++;
      updated.set(e.id, {
        ...e,
        reminderSentAt: new Date().toISOString(),
      });
      details.push({
        id: e.id,
        name: e.name,
        sent: true,
        channel,
        ...(previewSubject ? { subject: previewSubject } : {}),
      });
      activityInputs.push({
        action: "update",
        entity: "enrollments",
        label: `${e.name} — rappel J-48h`,
        username: "système",
        ip: "cron",
      });
    } else {
      failed++;
      details.push({ id: e.id, name: e.name, sent: false, channel });
    }
  }

  if (updated.size > 0) {
    // Le journal est mis à jour dans le MÊME writeStore que les demandes, sinon
    // l'écriture finale écraserait les événements ajoutés par appendActivity.
    const events: ActivityEvent[] = activityInputs.map((input) =>
      makeActivityEvent(input),
    );
    await writeStore({
      ...store,
      enrollments: enrollments.map((e) => updated.get(e.id) ?? e),
      activity: events.reduce(
        (list, event) => appendActivityEvent(list, event),
        store.activity ?? [],
      ),
    });
    invalidateStoreCache();
  }

  return {
    ok: true,
    checked: candidates.length,
    due: due.length,
    sent,
    failed,
    skippedNoEmail,
    details,
  };
}
