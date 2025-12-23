// app/api/admin/books/route.ts
import { NextResponse } from "next/server";
import { db } from "@/src/db/index";
import { book } from "@/src/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // NOTE: add authentication here in production
    const slug = body.slug ?? (body.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const inserted = await db.insert(book).values({
      slug,
      title: body.title,
      subtitle1: body.subtitle1,
      subtitle2: body.subtitle2,
      shortDescription: body.shortDescription,
      longDescription: body.longDescription,
      isPublished: !!body.isPublished,
      comingSoon: !!body.comingSoon,
      allowDirectSale: !!body.allowDirectSale,
      seoTitle: body.seoTitle,
      seoDescription: body.seoDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({ ok: true, book: inserted[0] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
