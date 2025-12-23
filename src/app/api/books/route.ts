// src/app/api/books/route.ts
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { book } from "../../../db/schema";

export async function GET() {
  const rows = await db.select().from(book).limit(50);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, subtitle1 } = body ?? {};

    if (!title || !slug) {
      return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
    }

    const [created] = await db.insert(book).values({
      title,
      slug,
      subtitle1: subtitle1 ?? null,
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/books error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
