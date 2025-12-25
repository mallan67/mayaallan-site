// src/app/api/admin/books/route.ts
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { book, bookRetailer, retailer } from "@/db/schema";
import { requireAdminOrThrow } from "@/lib/adminAuth";

/**
 * Book payload now includes optional `retailers`.
 */
const RetailerPayload = z.object({
  id: z.number().optional(),
  name: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  kind: z.string().optional().nullable(),
  url: z.string().url().optional(),
  isActive: z.boolean().optional(),
  logoUrl: z.string().optional().nullable(),
  types: z.array(z.string()).optional(),
}).strict();

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
  retailers: z.array(RetailerPayload).optional(),
}).strict();

/** Helper: ensure a retailer row exists, return its id */
async function ensureRetailerRow(r: z.infer<typeof RetailerPayload>) {
  if (!r) return null;

  // Try by id
  if (r.id) return r.id;

  // Try by slug
  if (r.slug) {
    const found = await db.select({ id: retailer.id }).from(retailer).where(eq(retailer.slug, r.slug)).limit(1);
    if (found.length) return found[0].id;
  }

  // Try by name
  if (r.name) {
    const found = await db.select({ id: retailer.id }).from(retailer).where(eq(retailer.name, r.name)).limit(1);
    if (found.length) return found[0].id;
  }

  // Insert new retailer
  const inserted = await db.insert(retailer).values({
    name: r.name ?? "",
    kind: r.kind ?? "",
    logoUrl: r.logoUrl ?? null,
  }).returning();
  return inserted[0].id;
}

/** GET (admin) */
export async function GET() {
  await requireAdminOrThrow();
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
    }).from(book).limit(200);
  return NextResponse.json({ ok: true, data: rows });
}

/** POST (create or update) */
export async function POST(req: Request) {
  await requireAdminOrThrow();
  const json = await req.json().catch(() => null);
  const parsed = BookPayload.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  const p = parsed.data;
  const values: any = {
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

  try {
    let bookId: number | null = null;

    if (p.id) {
      // Update book
      await db.update(book).set(values).where(eq(book.id, p.id));
      bookId = p.id;
    } else {
      // Insert new book
      const inserted = await db.insert(book).values(values).returning();
      bookId = inserted[0]?.id ?? null;
    }

    // If retailers were provided, replace book->retailer links
    if (bookId && Array.isArray(p.retailers)) {
      // Remove existing links for this book (simple replacement strategy)
      await db.delete(bookRetailer).where(eq(bookRetailer.bookId, bookId));

      // Insert new links
      for (const r of p.retailers) {
        // skip if no url and no name
        if (!r.url && !r.name && !r.slug) continue;
        const retailerId = await ensureRetailerRow(r);
        if (!retailerId) continue;

        await db.insert(bookRetailer).values({
          bookId,
          retailerId,
          url: r.url ?? "",
          isActive: r.isActive ?? true,
          types: r.types ?? [],
        }).returning();
      }
    }

    return NextResponse.json({ ok: true, data: bookId ? { id: bookId } : null });
  } catch (err: any) {
    console.error("POST /api/admin/books error:", err);
    return NextResponse.json({ ok: false, error: "internal" }, { status: 500 });
  }
}
