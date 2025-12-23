import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";


import { db } from "@/db";
import { adminUser } from "@/db/schema";
import { getAdminSession } from "@/lib/session";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const rows = await db
    .select()
    .from(adminUser)
    .where(eq(adminUser.email, email))
    .limit(1);

  const admin = rows[0];
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return NextResponse.json({ ok: false }, { status: 401 });

  const session = await getAdminSession();
  session.adminId = admin.id; // admin.id is a number in your Drizzle schema
  await session.save();

  return NextResponse.json({ ok: true });
}
