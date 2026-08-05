import { NextRequest, NextResponse } from "next/server";
import { clientKey, getActiveSessionFromRequest } from "@/lib/admin/auth";
import { appendActivity } from "@/lib/admin/activity";
import {
  emailConfigured,
  sendEnrollmentConfirmationEmail,
} from "@/lib/admin/email";
import { invalidateStoreCache } from "@/lib/admin/public";
import { readStore, writeStore } from "@/lib/admin/store";

export async function POST(req: NextRequest) {
  const session = await getActiveSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      action?: string;
      id?: string;
      startDate?: string;
    };
    const action = body.action ?? "";
    const id = body.id ?? "";
    const store = await readStore();
    const enrollments = store.enrollments ?? [];

    if (action === "confirm") {
      // Une demande en corbeille ne peut pas être confirmée.
      const item = enrollments.find((e) => e.id === id && !e.deletedAt);
      if (!item) {
        return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
      }
      // Une date de session invalide bloquerait silencieusement le rappel J-48h.
      const rawStart = body.startDate?.trim() ?? "";
      if (rawStart && Number.isNaN(Date.parse(rawStart))) {
        return NextResponse.json(
          { error: "Date de début de session invalide." },
          { status: 400 },
        );
      }
      if (item.status === "confirmed") {
        return NextResponse.json({
          ok: true,
          alreadyConfirmed: true,
          emailConfigured: emailConfigured(),
        });
      }

      const confirmed = {
        ...item,
        status: "confirmed" as const,
        confirmedAt: new Date().toISOString(),
        // Date/heure de début de la session (facultative) — déclenche le rappel J-48h.
        startDate: rawStart || undefined,
      };
      await writeStore({
        ...store,
        enrollments: enrollments.map((e) => (e.id === id ? confirmed : e)),
      });
      await appendActivity({
        action: "update",
        entity: "enrollments",
        label: item.name,
        username: session.user,
        ip: clientKey(req),
      });
      invalidateStoreCache();

      // Rappel par email au demandeur (best effort — jamais bloquant pour l'admin).
      let emailDelivered = false;
      const configured = emailConfigured();
      if (item.email && configured) {
        const result = await sendEnrollmentConfirmationEmail(item.email, {
          name: item.name,
          formation: item.formation,
        });
        emailDelivered = result.delivered;
      }

      return NextResponse.json({
        ok: true,
        enrollment: confirmed,
        emailDelivered,
        emailConfigured: configured,
      });
    }

    // Soft delete : la demande part en corbeille (`deletedAt`), jamais supprimée
    // du store — elle peut être restaurée ou purgée définitivement.
    if (action === "delete") {
      const item = enrollments.find((e) => e.id === id);
      if (!item) {
        return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
      }
      await writeStore({
        ...store,
        enrollments: enrollments.map((e) =>
          e.id === id ? { ...e, deletedAt: new Date().toISOString() } : e,
        ),
      });
      await appendActivity({
        action: "delete",
        entity: "enrollments",
        label: `${item.name} (corbeille)`,
        username: session.user,
        ip: clientKey(req),
      });
      invalidateStoreCache();
      return NextResponse.json({ ok: true });
    }

    // Restaure une demande depuis la corbeille (retire `deletedAt`).
    if (action === "restore") {
      const item = enrollments.find((e) => e.id === id && e.deletedAt);
      if (!item) {
        return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
      }
      const restored = { ...item };
      delete restored.deletedAt;
      await writeStore({
        ...store,
        enrollments: enrollments.map((e) => (e.id === id ? restored : e)),
      });
      await appendActivity({
        action: "update",
        entity: "enrollments",
        label: `${item.name} (restaurée)`,
        username: session.user,
        ip: clientKey(req),
      });
      invalidateStoreCache();
      return NextResponse.json({ ok: true, enrollment: restored });
    }

    // Purge définitive : retire réellement la demande du store.
    if (action === "purge") {
      const item = enrollments.find((e) => e.id === id);
      if (!item) {
        return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
      }
      await writeStore({
        ...store,
        enrollments: enrollments.filter((e) => e.id !== id),
      });
      await appendActivity({
        action: "delete",
        entity: "enrollments",
        label: `${item.name} (définitif)`,
        username: session.user,
        ip: clientKey(req),
      });
      invalidateStoreCache();
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  } catch (err) {
    console.error("[admin] enrollments POST failed:", err);
    return NextResponse.json({ error: "Action impossible" }, { status: 500 });
  }
}
