// src/app/api/admin/logout/route.ts
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";

export async function POST() {
  const session = await getAdminSession();
  if (session) {
    await session.destroy();
  }
  return NextResponse.json({ ok: true });
}
