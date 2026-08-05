import { NextRequest, NextResponse } from "next/server";
import { readUsersStore } from "@/lib/admin/users";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length < 16) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }
  try {
    const store = await readUsersStore();
    const invite = store.invites.find((i) => i.token === token);
    if (!invite) {
      return NextResponse.json({ valid: false }, { status: 404 });
    }

    const expired = Date.now() > new Date(invite.expiresAt).getTime();
    if (invite.used) {
      return NextResponse.json(
        { valid: false, reason: "used" },
        { status: 410 },
      );
    }
    if (expired) {
      return NextResponse.json(
        { valid: false, reason: "expired" },
        { status: 410 },
      );
    }

    // Compte ACTIF : l'invitation a déjà été consommée, le collaborateur
    // peut se connecter directement.
    const alreadyRegistered = store.users.some(
      (u) => u.email.toLowerCase() === invite.email.toLowerCase() && u.active,
    );
    // Compte créé mais NON encore vérifié (OTP en cours) : le collaborateur
    // doit pouvoir finaliser la validation (lien « Valider mon compte » de
    // l'email ou saisie du code OTP) — pas un blocage.
    const pendingVerification = store.users.some(
      (u) => u.email.toLowerCase() === invite.email.toLowerCase() && !u.active,
    );

    return NextResponse.json({
      valid: true,
      email: invite.email,
      alreadyRegistered,
      pendingVerification,
    });
  } catch (err) {
    console.error("[admin] invite status failed:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
