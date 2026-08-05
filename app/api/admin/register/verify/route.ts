import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/admin/auth";
import { appendActivity } from "@/lib/admin/activity";
import { clientKey } from "@/lib/admin/auth";
import { consumeRateLimit, resetRateLimit } from "@/lib/admin/rateLimit";
import {
  OTP_MAX_ATTEMPTS,
  otpMatches,
  readUsersStore,
  writeUsersStore,
} from "@/lib/admin/users";

// Limite de débit par adresse IP sur la vérification : 10 tentatives maximum
// par fenêtre de 15 minutes (en complément des 5 essais autorisés par
// invitation) — bloque le brute-force distribué sur plusieurs liens.
const OTP_VERIFY_MAX = 10;
const OTP_VERIFY_WINDOW_MS = 15 * 60 * 1000;

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { token?: string; code?: string };
    const token = body.token?.trim() ?? "";
    const code = body.code?.trim() ?? "";

    if (!token || token.length < 16 || !code) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }

    const verifyKey = `otp-verify:${clientKey(req)}`;
    const verifyLimit = await consumeRateLimit(
      verifyKey,
      OTP_VERIFY_MAX,
      OTP_VERIFY_WINDOW_MS,
    );
    if (!verifyLimit.allowed) {
      return NextResponse.json(
        {
          error: `Trop de tentatives. Réessayez dans ${Math.max(
            1,
            Math.ceil(verifyLimit.retryAfterMs / 60000),
          )} min.`,
        },
        { status: 429 },
      );
    }

    const store = await readUsersStore();
    const invite = store.invites.find((i) => i.token === token);

    if (!invite) {
      return NextResponse.json({ error: "Lien d'invitation invalide." }, { status: 400 });
    }
    if (invite.used) {
      return NextResponse.json({ error: "Compte déjà validé." }, { status: 410 });
    }
    if (Date.now() > new Date(invite.expiresAt).getTime()) {
      return NextResponse.json(
        { error: "Cette invitation a expiré." },
        { status: 410 },
      );
    }

    const attempts = invite.otpAttempts ?? 0;
    if (attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Trop de tentatives. Demandez une nouvelle invitation." },
        { status: 429 },
      );
    }

    const otpExpired = Boolean(
      invite.otpExpiresAt && Date.now() > new Date(invite.otpExpiresAt).getTime(),
    );

    const valid =
      code.length >= 32 && invite.verifyToken
        ? safeEqual(code, invite.verifyToken)
        : Boolean(
            !otpExpired &&
              invite.otpHash &&
              otpMatches(code, token, invite.otpHash),
          );

    if (!valid) {
      await writeUsersStore({
        ...store,
        invites: store.invites.map((i) =>
          i.token === token ? { ...i, otpAttempts: attempts + 1 } : i,
        ),
      });
      const remaining = OTP_MAX_ATTEMPTS - attempts - 1;
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Code incorrect. Il vous reste ${remaining} tentative${remaining > 1 ? "s" : ""}.`
              : "Trop de tentatives. Demandez une nouvelle invitation.",
        },
        { status: 400 },
      );
    }

    const user = store.users.find(
      (u) =>
        u.email.toLowerCase() === invite.email.toLowerCase() && !u.active,
    );
    if (!user) {
      return NextResponse.json(
        { error: "Aucun compte en attente de validation." },
        { status: 400 },
      );
    }

    await writeUsersStore({
      ...store,
      users: store.users.map((u) =>
        u.id === user.id ? { ...u, active: true } : u,
      ),
      invites: store.invites.map((i) =>
        i.token === token
          ? {
              ...i,
              used: true,
              otpHash: undefined,
              verifyToken: undefined,
              otpExpiresAt: undefined,
              otpAttempts: undefined,
            }
          : i,
      ),
    });

    // Vérification réussie : on relâche la limite de débit de cette IP.
    await resetRateLimit(verifyKey);

    await appendActivity({
      action: "create",
      entity: "admins",
      label: user.username,
      username: user.username,
      ip: clientKey(req),
    });

    const sessionToken = createSessionToken(user.username);
    const res = NextResponse.json({ ok: true, user: user.username });
    res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());
    return res;
  } catch (err) {
    console.error("[admin] verify failed:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
