import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? null,
    HAS_SESSION_SECRET: Boolean(process.env.SESSION_SECRET),
  });
}
