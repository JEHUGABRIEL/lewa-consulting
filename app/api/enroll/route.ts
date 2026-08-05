import { NextRequest, NextResponse } from "next/server";
import { invalidateStoreCache } from "@/lib/admin/public";
import { readStore, writeStore } from "@/lib/admin/store";
import { consumeFixedWindow } from "@/lib/admin/rateStore";
import type { EnrollmentRequest } from "@/lib/admin/constants";

// Limite anti-spam : 5 demandes par heure et par IP. Compteur partagé entre
// instances via rateStore (Supabase + repli fichier) — un stockage fichier
// local serait réinitialisé/non synchronisé en serverless.
const MAX_PER_HOUR = 5;
const WINDOW_MS = 60 * 60 * 1000;

// Plafond global de demandes stockées : borne la taille de admin-store.json et
// empêche la dégradation progressive des lectures en cas de flooding. Au-delà,
// on refuse de nouvelles demandes (l'admin doit purger la corbeille / exporter).
const MAX_ENROLLMENTS = 10_000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indicatif pays (ex. « +236 ») — doit correspondre au format E.164.
const COUNTRY_CODE_RE = /^\+\d{1,4}$/;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const formation = typeof body?.formation === "string" ? body.formation.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const countryCode =
    typeof body?.countryCode === "string" ? body.countryCode.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const availability =
    typeof body?.availability === "string" ? body.availability.trim() : "";

  if (!formation || formation.length > 200) {
    return NextResponse.json({ error: "Formation invalide" }, { status: 400 });
  }
  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
  }
  if (!phone || phone.replace(/\D/g, "").length < 8 || phone.length > 30) {
    return NextResponse.json({ error: "Téléphone invalide" }, { status: 400 });
  }
  if (countryCode && !COUNTRY_CODE_RE.test(countryCode)) {
    return NextResponse.json({ error: "Indicatif pays invalide" }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  if (availability.length > 200) {
    return NextResponse.json({ error: "Disponibilité invalide" }, { status: 400 });
  }

  // Garde-fou anti-spam (fenêtre glissante d'une heure) — après validation
  // pour ne pas pénaliser les utilisateurs ayant fait une simple faute de frappe.
  // Compteur partagé entre instances (rateStore) : en cas d'indisponibilité,
  // consumeFixedWindow retombe sur le fichier et ne bloque jamais l'inscription.
  try {
    const limit = await consumeFixedWindow(`enroll:${ip}`, MAX_PER_HOUR, WINDOW_MS);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Trop de demandes. Réessayez plus tard." },
        { status: 429 },
      );
    }
  } catch (err) {
    console.error("[enroll] rate-limit indisponible :", err);
  }

  try {
    const store = await readStore();

    // Plafond global : borne la taille du store et coupe court à un flooding
    // qui saturerait admin-store.json (dégradation des lectures).
    if ((store.enrollments?.length ?? 0) >= MAX_ENROLLMENTS) {
      console.warn(
        `[enroll] plafond de ${MAX_ENROLLMENTS} demandes atteint — nouvelle demande refusée.`,
      );
      return NextResponse.json(
        { error: "Les inscriptions sont temporairement indisponibles. Réessayez plus tard." },
        { status: 503 },
      );
    }

    const now = new Date().toISOString();
    const enrollment: EnrollmentRequest = {
      id: crypto.randomUUID(),
      formation,
      name,
      phone,
      countryCode: countryCode || undefined,
      email: email || undefined,
      availability: availability || undefined,
      status: "pending",
      createdAt: now,
    };

    await writeStore({
      ...store,
      enrollments: [...(store.enrollments ?? []), enrollment],
    });
    invalidateStoreCache();

    return NextResponse.json({ ok: true, id: enrollment.id }, { status: 201 });
  } catch (err) {
    console.error("[enroll] enregistrement impossible :", err);
    return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 });
  }
}
