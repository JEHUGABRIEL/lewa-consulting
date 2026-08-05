import { NextRequest, NextResponse } from "next/server";
import { clientKey, getActiveSessionFromRequest } from "@/lib/admin/auth";
import { appendActivity } from "@/lib/admin/activity";
import { emailConfigured, sendInvitationEmail } from "@/lib/admin/email";
import { publicInviteLink } from "@/lib/admin/constants";
import {
  INVITE_TTL_MS,
  newToken,
  readUsersStore,
  writeUsersStore,
  type AdminInvite,
} from "@/lib/admin/users";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: NextRequest) {
  if (!(await getActiveSessionFromRequest(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const store = await readUsersStore();
    const invites = store.invites
      .map((i) => ({
        token: i.token,
        email: i.email,
        createdBy: i.createdBy,
        createdAt: i.createdAt,
        expiresAt: i.expiresAt,
        used: i.used,
        expired: Date.now() > new Date(i.expiresAt).getTime(),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ invites, emailConfigured: emailConfigured() });
  } catch (err) {
    console.error("[admin] invites GET failed:", err);
    return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getActiveSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
    }

    const store = await readUsersStore();

    const existingUser = store.users.find(
      (u) => u.email.toLowerCase() === email,
    );
    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte administrateur existe déjà pour cette adresse email." },
        { status: 409 },
      );
    }

    const pending = store.invites.find(
      (i) => i.email.toLowerCase() === email && !i.used,
    );
    if (pending && Date.now() < new Date(pending.expiresAt).getTime()) {
      return NextResponse.json({
        link: publicInviteLink(pending.token),
        alreadyPending: true,
        emailConfigured: emailConfigured(),
      });
    }

    const token = newToken();
    const now = new Date();
    const invite: AdminInvite = {
      token,
      email,
      createdBy: session.user,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + INVITE_TTL_MS).toISOString(),
      used: false,
    };

    await writeUsersStore({ ...store, invites: [...store.invites, invite] });

    const link = publicInviteLink(token);
    const emailResult = await sendInvitationEmail(email, link);

    await appendActivity({
      action: "create",
      entity: "admins",
      label: email,
      username: session.user,
      ip: clientKey(req),
    });

    return NextResponse.json({
      link,
      emailDelivered: emailResult.delivered,
      emailConfigured: emailConfigured(),
    });
  } catch (err) {
    console.error("[admin] invites POST failed:", err);
    return NextResponse.json({ error: "Création impossible" }, { status: 500 });
  }
}
