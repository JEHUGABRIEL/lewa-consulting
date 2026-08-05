import { NextRequest, NextResponse } from "next/server";
import { processDueReminders } from "@/lib/admin/reminders";

/**
 * Endpoint de rappels automatiques (J-48h avant le début d'une formation).
 * À déclencher périodiquement (cron horaire) :
 *   - Vercel : `vercel.json` → crons (header `Authorization: Bearer $CRON_SECRET`
 *     ajouté automatiquement quand la variable d'environnement est définie) ;
 *   - externe : GET/POST avec le header `Authorization: Bearer <CRON_SECRET>`.
 *
 * Sans `CRON_SECRET` configurée, l'endpoint refuse (403) — aucune exécution.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET non configurée." },
      { status: 503 },
    );
  }
  const header = req.headers.get("authorization") ?? "";
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Non autorisé." }, { status: 403 });
  }
  const result = await processDueReminders();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  return GET(req);
}
