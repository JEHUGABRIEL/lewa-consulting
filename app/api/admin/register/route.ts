import { NextRequest, NextResponse } from "next/server";
import { publicInviteLink } from "@/lib/admin/constants";
import { clientKey } from "@/lib/admin/auth";
import { emailConfigured, sendOtpEmail } from "@/lib/admin/email";
import { consumeRateLimit } from "@/lib/admin/rateLimit";
import {
  OTP_TTL_MS,
  hashOtp,
  hashPassword,
  newOtp,
  newToken,
  readUsersStore,
  writeUsersStore,
} from "@/lib/admin/users";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,32}$/;

// Limite de génération de codes OTP : 5 codes maximum par heure et par adresse
// email (et IP) — empêche l'envoi répété d'emails de vérification.
const OTP_GEN_MAX = 5;
const OTP_GEN_WINDOW_MS = 60 * 60 * 1000;

function envAdminUsername(): string | null {
  const v = process.env.ADMIN_USERNAME;
  return v && v.trim() ? v.trim().toLowerCase() : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      token?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      email?: string;
      password?: string;
    };

    const token = body.token?.trim() ?? "";
    const firstName = body.firstName?.trim() ?? "";
    const lastName = body.lastName?.trim() ?? "";
    const username = body.username?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!token || token.length < 16) {
      return NextResponse.json({ error: "Lien d'invitation invalide." }, { status: 400 });
    }
    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Veuillez saisir votre nom et prénom." }, { status: 400 });
    }
    if (!USERNAME_RE.test(username)) {
      return NextResponse.json(
        { error: "Nom d'utilisateur invalide (3 à 32 caractères : lettres, chiffres, . _ -)." },
        { status: 400 },
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 },
      );
    }

    const store = await readUsersStore();
    const invite = store.invites.find((i) => i.token === token);

    if (!invite) {
      return NextResponse.json({ error: "Lien d'invitation invalide." }, { status: 400 });
    }
    if (invite.used) {
      return NextResponse.json(
        { error: "Cette invitation a déjà été utilisée." },
        { status: 410 },
      );
    }
    if (Date.now() > new Date(invite.expiresAt).getTime()) {
      return NextResponse.json(
        { error: "Cette invitation a expiré. Demandez-en une nouvelle." },
        { status: 410 },
      );
    }
    if (invite.email.toLowerCase() !== email) {
      return NextResponse.json(
        { error: "L'adresse email ne correspond pas à l'invitation." },
        { status: 400 },
      );
    }

    const usernameTaken = store.users.some(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
    if (usernameTaken || username.toLowerCase() === envAdminUsername()) {
      return NextResponse.json(
        { error: "Ce nom d'utilisateur est déjà utilisé." },
        { status: 409 },
      );
    }
    const emailTaken = store.users.some(
      (u) => u.email.toLowerCase() === email,
    );
    if (emailTaken) {
      return NextResponse.json(
        { error: "Un compte existe déjà pour cette adresse email." },
        { status: 409 },
      );
    }

    const genKey = `otp-gen:${email}:${clientKey(req)}`;
    const genLimit = await consumeRateLimit(
      genKey,
      OTP_GEN_MAX,
      OTP_GEN_WINDOW_MS,
    );
    if (!genLimit.allowed) {
      return NextResponse.json(
        {
          error: `Trop de codes envoyés. Réessayez dans ${Math.max(
            1,
            Math.ceil(genLimit.retryAfterMs / 60000),
          )} min.`,
        },
        { status: 429 },
      );
    }

    const { salt, hash } = hashPassword(password);
    const otp = newOtp();
    const verifyToken = newToken(32);
    const now = new Date();

    const user = {
      id: newToken(12),
      username,
      firstName,
      lastName,
      email,
      salt,
      passwordHash: hash,
      active: false,
      createdAt: now.toISOString(),
      invitedBy: invite.createdBy,
    };

    await writeUsersStore({
      ...store,
      users: [...store.users, user],
      invites: store.invites.map((i) =>
        i.token === token
          ? {
              ...i,
              otpHash: hashOtp(otp, token),
              verifyToken,
              otpExpiresAt: new Date(now.getTime() + OTP_TTL_MS).toISOString(),
              otpAttempts: 0,
            }
          : i,
      ),
    });

    const verifyLink = publicInviteLink(token, verifyToken);
    const emailResult = await sendOtpEmail(email, otp, verifyLink);


    const emailConfiguredNow = emailConfigured();
    // Repli DÉVELOPPEMENT uniquement : si l'email n'est pas envoyé, on affiche le
    // code à l'écran pour tester le flux. En production, on ne renvoie JAMAIS le
    // code dans la réponse HTTP (il ne doit transiter que par l'email) — sinon le
    // second facteur serait exposé à tout appelant dès que l'envoi échoue.
    const isProd = process.env.NODE_ENV === "production";
    const devOtp =
      !isProd && !(emailConfiguredNow && emailResult.delivered) ? otp : undefined;

    return NextResponse.json({
      ok: true,
      otpSent: emailResult.delivered,
      emailConfigured: emailConfiguredNow,
      ...(devOtp ? { devOtp } : {}),
    });
  } catch (err) {
    console.error("[admin] register failed:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
