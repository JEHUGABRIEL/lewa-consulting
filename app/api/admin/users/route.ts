import { NextRequest, NextResponse } from "next/server";
import { publicInviteLink } from "@/lib/admin/constants";
import { clientKey, getActiveSessionFromRequest } from "@/lib/admin/auth";
import { appendActivity } from "@/lib/admin/activity";
import { emailConfigured, sendInvitationEmail } from "@/lib/admin/email";
import {
  readUsersStore,
  writeUsersStore,
  type AdminInvite,
  type AdminUser,
  type UsersStore,
} from "@/lib/admin/users";

type SafeUser = Pick<
  AdminUser,
  | "id"
  | "username"
  | "firstName"
  | "lastName"
  | "email"
  | "active"
  | "createdAt"
  | "invitedBy"
>;

function toSafeUser(u: AdminUser): SafeUser {
  return {
    id: u.id,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    active: u.active,
    createdAt: u.createdAt,
    invitedBy: u.invitedBy,
  };
}

function toSafeInvite(i: AdminInvite) {
  return {
    token: i.token,
    email: i.email,
    createdBy: i.createdBy,
    createdAt: i.createdAt,
    expiresAt: i.expiresAt,
    used: i.used,
    expired: Date.now() > new Date(i.expiresAt).getTime(),
  };
}

function payload(store: UsersStore) {
  return NextResponse.json({
    users: store.users
      .map(toSafeUser)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    invites: store.invites
      .map(toSafeInvite)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    emailConfigured: emailConfigured(),
  });
}

export async function GET(req: NextRequest) {
  if (!(await getActiveSessionFromRequest(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const store = await readUsersStore();
    return payload(store);
  } catch (err) {
    console.error("[admin] users GET failed:", err);
    return NextResponse.json({ error: "Lecture impossible" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getActiveSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      action?: string;
      userId?: string;
      inviteToken?: string;
    };
    const action = body.action ?? "";
    const store = await readUsersStore();

    if (action === "activate" || action === "deactivate") {
      const userId = body.userId ?? "";
      const user = store.users.find((u) => u.id === userId);
      if (!user) {
        return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
      }
      if (user.username.toLowerCase() === session.user.toLowerCase()) {
        return NextResponse.json(
          { error: "Vous ne pouvez pas modifier votre propre compte." },
          { status: 400 },
        );
      }
      const active = action === "activate";
      const next = await writeUsersStore({
        ...store,
        users: store.users.map((u) => (u.id === userId ? { ...u, active } : u)),
      });
      await appendActivity({
        action: "update",
        entity: "admins",
        label: user.username,
        username: session.user,
        ip: clientKey(req),
      });
      return payload(next);
    }

    // Pas de suppression définitive de compte : la « suppression » passe par la
    // désactivation (`deactivate`, action ci-dessus) — le compte reste récupérable.

    if (action === "deleteInvite") {
      const inviteToken = body.inviteToken ?? "";
      const invite = store.invites.find((i) => i.token === inviteToken);
      if (!invite) {
        return NextResponse.json({ error: "Invitation introuvable." }, { status: 404 });
      }
      const next = await writeUsersStore({
        ...store,
        invites: store.invites.filter((i) => i.token !== inviteToken),
      });
      await appendActivity({
        action: "delete",
        entity: "admins",
        label: invite.email,
        username: session.user,
        ip: clientKey(req),
      });
      return payload(next);
    }

    if (action === "resendInvite") {
      const inviteToken = body.inviteToken ?? "";
      const invite = store.invites.find((i) => i.token === inviteToken);
      if (
        !invite ||
        invite.used ||
        Date.now() > new Date(invite.expiresAt).getTime()
      ) {
        return NextResponse.json(
          { error: "Invitation introuvable ou expirée." },
          { status: 404 },
        );
      }
      const link = publicInviteLink(inviteToken);
      const emailResult = await sendInvitationEmail(invite.email, link);
      await appendActivity({
        action: "update",
        entity: "admins",
        label: invite.email,
        username: session.user,
        ip: clientKey(req),
      });
      return NextResponse.json({
        ok: true,
        emailDelivered: emailResult.delivered,
        emailConfigured: emailConfigured(),
      });
    }

    return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  } catch (err) {
    console.error("[admin] users POST failed:", err);
    return NextResponse.json({ error: "Action impossible" }, { status: 500 });
  }
}
