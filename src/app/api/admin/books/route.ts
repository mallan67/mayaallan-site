// src/app/api/admin/books/route.ts
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { book } from "@/db/schema";

import { requireAdminOrThrow } from "@/lib/adminAuth";

const BookPayload = z.object({
  id: z.number().optional(),
  title: z.string().min(1),
  subtitle1: z.string().optional().nullable(),
  subtitle2: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isbn: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  backCoverImageUrl: z.string().optional().nullable(),
  allowDirectSale: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  comingSoon: z.boolean().optional(),
});

export async function GET() {
  requireAdminOrThrow();
  const rows = await db.select({
      id: book.id,
      slug: book.slug,
      title: book.title,
      subtitle1: book.subtitle1,
      subtitle2: book.subtitle2,
      tags: book.tags,
      isbn: book.isbn,
      shortDescription: book.shortDescription,
      longDescription: book.longDescription,
      coverImageUrl: book.coverImageUrl,
      backCoverImageUrl: book.backCoverImageUrl,
      allowDirectSale: book.allowDirectSale,
      stripeProductId: book.stripeProductId,
      paypalProductId: book.paypalProductId,
      isPublished: book.isPublished,
      comingSoon: book.comingSoon,
      seoTitle: book.seoTitle,
      seoDescription: book.seoDescription,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt
    }) . ".from(book)".limit(200);
  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(req: Request) {
  requireAdminOrThrow();
  const json = await req.json().catch(() => null);
  const parsed = BookPayload.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  const p = parsed.data;
  const values = {
    title: p.title,
    subtitle1: p.subtitle1 ?? null,
    subtitle2: p.subtitle2 ?? null,
    tags: p.tags ?? [],
    isbn: p.isbn ?? null,
    shortDescription: p.shortDescription ?? null,
    longDescription: p.longDescription ?? null,
    coverImageUrl: p.coverImageUrl ?? null,
    backCoverImageUrl: p.backCoverImageUrl ?? null,
    allowDirectSale: !!p.allowDirectSale,
    isPublished: !!p.isPublished,
    comingSoon: !!p.comingSoon,
  };

  if (p.id) {
    await db.update(book).set(values).where(eq(book.id, p.id));
    return NextResponse.json({ ok: true });
  } else {
    const inserted = await db.insert(book).values(values).returning();
    return NextResponse.json({ ok: true, data: inserted[0] ?? null });
  }
}
