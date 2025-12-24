// src/app/api/books/route.ts
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { book } from "../../../db/schema";

/**
 * GET /api/books
 */
export async function GET() {
  try {
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
    }).from(book).limit(50);
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET /api/books error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

/**
 * POST /api/books
 * Expects JSON { title, slug, subtitle1?, subtitle2?, isPublished?, comingSoon? }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, subtitle1, subtitle2, isPublished, comingSoon } = body ?? {};

    if (!title || !slug) {
      return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
    }

    // IMPORTANT: use the camelCase property names from src/db/schema.ts
    const [created] = await db.insert(book).values({
      title,
      slug,
      subtitle1: subtitle1 ?? null,
      subtitle2: subtitle2 ?? null,
      isPublished: Boolean(isPublished) ?? false,
      comingSoon: Boolean(comingSoon) ?? false,
    }).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/books error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
