import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  clientKey,
  getSessionFromRequest,
  sessionCookieOptions,
} from "@/lib/admin/auth";
import { appendActivity } from "@/lib/admin/activity";

export async function POST(req: NextRequest) {


  const session = getSessionFromRequest(req);
  if (session) {
    await appendActivity({ action: "logout", username: session.user, ip: clientKey(req) });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
}
