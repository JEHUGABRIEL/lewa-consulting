import { NextRequest, NextResponse } from "next/server";
import { getActiveSessionFromRequest } from "@/lib/admin/auth";

export async function GET(req: NextRequest) {
  const session = await getActiveSessionFromRequest(req);
  return NextResponse.json({
    authenticated: session !== null,
    user: session?.user ?? null,
  });
}
