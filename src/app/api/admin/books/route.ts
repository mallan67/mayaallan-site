// src/app/api/admin/books/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { book, bookRetailerLink, retailer } from "@/db/schema";
import { requireAdminApi } from "@/lib/adminAuth";

const RetailerPayload = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  kind: z.string().optional(),
  url: z.string().url(),
  logoUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  types: z.array(z.string()).optional(),
});

const BookPayload = z.object({
  id: z.number().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle1: z.string().optional().nullable(),
  subtitle2: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  isbn: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  longDescription: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  backCoverImageUrl: z.string().optional().nullable(),
  directSaleEnabled: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  comingSoon: z.boolean().optional(),
  salesMetadata: z.record(z.string(), z.any()).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  retailers: z.array(RetailerPayload).optional(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  const guard = await requireAdminApi(req);
  if (guard) return guard;

  const rows = await db.select().from(book).limit(200);
  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(req: NextRequest) {
  const guard = await requireAdminApi(req);
  if (guard) return guard;

  const json = await req.json().catch(() => null);
  const parsed = BookPayload.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  const p = parsed.data;
  const values = {
    slug: p.slug,
    title: p.title,
    subtitle1: p.subtitle1 ?? null,
    subtitle2: p.subtitle2 ?? null,
    tags: p.tags ?? [],
    isbn: p.isbn ?? null,
    shortDescription: p.shortDescription ?? null,
    longDescription: p.longDescription ?? null,
    coverImageUrl: p.coverImageUrl ?? null,
    backCoverImageUrl: p.backCoverImageUrl ?? null,
    directSaleEnabled: !!p.directSaleEnabled,
    isPublished: !!p.isPublished,
    comingSoon: !!p.comingSoon,
    salesMetadata: p.salesMetadata ?? {},
    seoTitle: p.seoTitle ?? null,
    seoDescription: p.seoDescription ?? null,
  };

  const [saved] = await db
    .insert(book)
    .values(values)
    .onConflictDoUpdate({
      target: book.slug,
      set: values,
    })
    .returning({ id: book.id });

  const bookId = saved?.id;
  if (!bookId) {
    return NextResponse.json({ ok: false, error: "Unable to save book" }, { status: 500 });
  }

  if (p.retailers && p.retailers.length > 0) {
    await db.transaction(async (tx) => {
      await tx.delete(bookRetailerLink).where(eq(bookRetailerLink.bookId, bookId));

      for (const r of p.retailers ?? []) {
        const retailerSlug = slugify(r.slug ?? r.name);
        const [ret] = await tx
          .insert(retailer)
          .values({
            name: r.name,
            slug: retailerSlug,
            kind: r.kind ?? "marketplace",
            iconUrl: r.logoUrl ?? null,
            isActive: r.isActive ?? true,
          })
          .onConflictDoUpdate({
            target: retailer.slug,
            set: {
              name: r.name,
              kind: r.kind ?? "marketplace",
              iconUrl: r.logoUrl ?? null,
              isActive: r.isActive ?? true,
              updatedAt: sql`now()`,
            },
          })
          .returning({ id: retailer.id });

        await tx
          .insert(bookRetailerLink)
          .values({
            bookId,
            retailerId: ret.id,
            url: r.url,
            isActive: r.isActive ?? true,
            types: r.types ?? [],
          })
          .onConflictDoUpdate({
            target: [bookRetailerLink.bookId, bookRetailerLink.retailerId],
            set: {
              url: r.url,
              isActive: r.isActive ?? true,
              types: r.types ?? [],
              updatedAt: sql`now()`,
            },
          });
      }
    });
  }

  return NextResponse.json({ ok: true, data: { id: bookId } });
}
