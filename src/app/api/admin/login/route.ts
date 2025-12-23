import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { adminUser } from "@/db/schema";
import { getAdminSession } from "@/lib/session";
import { adminPasswordMatches } from "@/lib/adminAuth";

const Body = z.object({
  email: z.string().email().optional(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const session = await getAdminSession().catch(() => null);
  if (!session) {
    return NextResponse.json({ ok: false, error: "Session not available" }, { status: 500 });
  }

  if (adminPasswordMatches(password)) {
    session.adminId = -1;
    await session.save();
    return NextResponse.json({ ok: true, via: "env" });
  }

  if (!email) {
    return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
  }

  const rows = await db.select().from(adminUser).where(eq(adminUser.email, email)).limit(1);

  const admin = rows[0];
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });

  session.adminId = admin.id; // admin.id is a number in your Drizzle schema
  await session.save();

  return NextResponse.json({ ok: true });
}
