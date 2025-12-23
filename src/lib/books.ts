import { desc, eq, or } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";

import { db } from "@/db";
import { book, bookRetailerLink, retailer } from "@/db/schema";
import { canonicalFor, getSiteUrl, toAbsoluteUrl } from "./urls";

export type BookRecord = InferSelectModel<typeof book>;
export type RetailerRecord = InferSelectModel<typeof retailer>;

export type RetailerLink = {
  retailerId?: number;
  name: string;
  slug: string;
  kind?: string | null;
  url: string;
  logoUrl?: string | null;
  isActive?: boolean;
  types?: string[];
};

export type BookWithLinks = {
  book: BookRecord;
  retailers: RetailerLink[];
};

export const DEFAULT_BOOK_SLUG = "guide-to-psilocybin-integration";

const defaultBook: BookWithLinks = {
  book: {
    id: -1,
    slug: DEFAULT_BOOK_SLUG,
    title: "Guide to Psilocybin Integration",
    subtitle1: "40 Real Scenarios for Navigating What You See, Feel & Experience",
    subtitle2: "Practical prompts for grounding breakthroughs and calming challenges",
    isbn: null,
    shortDescription:
      "An actionable handbook with 40 real-life scenarios to help you integrate challenging or illuminating psychedelic experiences with clarity, safety, and self-agency.",
    longDescription:
      "Grounded prompts and reflective exercises to help you navigate what you see, feel, and experience. This guide was created to support safe, thoughtful integration and is purely educational—not medical advice.",
    coverImageUrl:
      "https://dummyimage.com/640x960/0f172a/faf5ff&text=Guide+to+Psilocybin+Integration",
    backCoverImageUrl: null,
    directSaleEnabled: false,
    stripeProductId: null,
    paypalButtonId: null,
    isPublished: true,
    comingSoon: false,
    tags: ["psychedelics", "integration", "healing"],
    salesMetadata: {},
    seo: {},
    seoTitle: "Guide to Psilocybin Integration",
    seoDescription:
      "Maya Allan's Guide to Psilocybin Integration: 40 real scenarios for working through psychedelic experiences with grounded reflection.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  retailers: [
    {
      name: "Amazon",
      slug: "amazon",
      kind: "marketplace",
      url: "https://www.amazon.com/",
      logoUrl: null,
      isActive: true,
    },
    {
      name: "Lulu",
      slug: "lulu",
      kind: "print-on-demand",
      url: "https://www.lulu.com/",
      logoUrl: null,
      isActive: true,
    },
  ],
};

function isDbReady() {
  return !(db as any).__is_dummy_db;
}

function normalizeBookRow(row: BookRecord): BookRecord {
  const tags = Array.isArray(row.tags) ? row.tags : [];
  return { ...row, tags };
}

function normalizeRetailerLinks(rows: RetailerLink[]): RetailerLink[] {
  return rows.map((r) => ({
    ...r,
    isActive: r.isActive ?? true,
    url: r.url,
    logoUrl: r.logoUrl ?? null,
    types: Array.isArray(r.types) ? r.types : [],
  }));
}

export async function fetchBookWithLinks(slug: string): Promise<BookWithLinks | null> {
  if (!isDbReady()) {
    if (slug === DEFAULT_BOOK_SLUG) return defaultBook;
    return null;
  }

  const [row] = await db
    .select({
      id: book.id,
      slug: book.slug,
      title: book.title,
      subtitle1: book.subtitle1,
      subtitle2: book.subtitle2,
      isbn: book.isbn,
      shortDescription: book.shortDescription,
      longDescription: book.longDescription,
      coverImageUrl: book.coverImageUrl,
      backCoverImageUrl: book.backCoverImageUrl,
      directSaleEnabled: book.directSaleEnabled,
      stripeProductId: book.stripeProductId,
      paypalButtonId: book.paypalButtonId,
      isPublished: book.isPublished,
      comingSoon: book.comingSoon,
      tags: book.tags,
      salesMetadata: book.salesMetadata,
      seo: book.seo,
      seoTitle: book.seoTitle,
      seoDescription: book.seoDescription,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    })
    .from(book)
    .where(eq(book.slug, slug))
    .limit(1);

  if (!row) {
    if (slug === DEFAULT_BOOK_SLUG) return defaultBook;
    return null;
  }

  const retailers = await db
    .select({
      retailerId: retailer.id,
      name: retailer.name,
      slug: retailer.slug,
      kind: retailer.kind,
      url: bookRetailerLink.url,
      isActive: bookRetailerLink.isActive,
      logoUrl: retailer.iconUrl,
      types: bookRetailerLink.types,
    })
    .from(bookRetailerLink)
    .innerJoin(retailer, eq(retailer.id, bookRetailerLink.retailerId))
    .where(eq(bookRetailerLink.bookId, row.id))
    .orderBy(retailer.name);

  return { book: normalizeBookRow(row), retailers: normalizeRetailerLinks(retailers) };
}

export async function fetchFeaturedBook(): Promise<BookWithLinks> {
  if (!isDbReady()) return defaultBook;

  const [live] = await db
    .select({ slug: book.slug })
    .from(book)
    .where(or(eq(book.isPublished, true), eq(book.comingSoon, true)))
    .orderBy(desc(book.isPublished), desc(book.createdAt))
    .limit(1);

  if (!live?.slug) return defaultBook;

  return (await fetchBookWithLinks(live.slug)) ?? defaultBook;
}

export async function fetchAllLiveBooks(): Promise<BookRecord[]> {
  if (!isDbReady()) return [defaultBook.book];

  const rows = await db
    .select()
    .from(book)
    .where(or(eq(book.isPublished, true), eq(book.comingSoon, true)))
    .orderBy(desc(book.createdAt));

  return rows.map(normalizeBookRow);
}

export function getBookCoverUrl(b: BookRecord) {
  return toAbsoluteUrl(b.coverImageUrl ?? b.backCoverImageUrl ?? "/og-default.png");
}

export function bookCanonicalUrl(slug: string) {
  return canonicalFor(`/books/${slug}`);
}

export function buildBookJsonLd(payload: BookWithLinks) {
  const siteUrl = getSiteUrl();
  const image = getBookCoverUrl(payload.book) ?? `${siteUrl}/og-default.png`;

  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: payload.book.title,
    image,
    description: payload.book.shortDescription ?? payload.book.longDescription ?? "",
    url: bookCanonicalUrl(payload.book.slug),
    offers: (payload.retailers || [])
      .filter((l) => l.isActive !== false && l.url)
      .map((l) => ({
        "@type": "Offer",
        url: l.url,
        seller: { "@type": "Organization", name: l.name },
      })),
  };
}
