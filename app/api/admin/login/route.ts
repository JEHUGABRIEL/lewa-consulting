import { NextRequest, NextResponse } from "next/server";
import {
  clearLoginFailures,
  clientKey,
  createSessionToken,
  loginLockRemaining,
  recordLoginFailure,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyAnyCredentials,
} from "@/lib/admin/auth";
import { appendActivity } from "@/lib/admin/activity";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = (await req.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ error: "Identifiants requis" }, { status: 400 });
  }

  // Deux clés de verrouillage complémentaires :
  //   - `ipKey`   : par adresse (issue de X-Forwarded-For) — anti-spam distribué ;
  //   - `userKey` : par nom d'utilisateur — indispensable car X-Forwarded-For est
  //                 fourni par le client et peut être renouvelé à chaque requête,
  //                 ce qui réinitialiserait un verrou uniquement basé sur l'IP.
  //     Le verrou par compte plafonne donc le brute-force quelle que soit l'IP.
  const ipKey = clientKey(req);
  const userKey = `u:${username.toLowerCase()}`;

  const lock = Math.max(
    await loginLockRemaining(ipKey),
    await loginLockRemaining(userKey),
  );
  if (lock > 0) {
    return NextResponse.json(
      { error: `Trop de tentatives. Réessayez dans ${Math.ceil(lock / 60)} min.` },
      { status: 429 },
    );
  }

  const key = ipKey;

  let token: string;
  try {
    if (!(await verifyAnyCredentials(username, password))) {
      await recordLoginFailure(ipKey);
      await recordLoginFailure(userKey);
      return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
    }
    token = createSessionToken(username);
  } catch (err) {
    console.error("[admin] login failed:", err);
    return NextResponse.json({ error: "Configuration serveur incomplète" }, { status: 500 });
  }

  await clearLoginFailures(ipKey);
  await clearLoginFailures(userKey);


  await appendActivity({ action: "login", username, ip: key });

  const res = NextResponse.json({ ok: true, user: username });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
