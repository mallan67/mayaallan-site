export const dynamic = "force-dynamic"; // Next 14: prevents static prerender, runs at request time
import { desc } from "drizzle-orm";
import Link from "next/link";
import { book } from "@/db/schema";

type BookRow = {
  id: number;
  slug: string;
  title: string;
  subtitle1?: string | null;
  subtitle2?: string | null;
  tags?: string | null;
  isbn?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  coverImageUrl?: string | null;
  backCoverImageUrl?: string | null;
  allowDirectSale?: boolean | null;
  stripeProductId?: string | null;
  paypalProductId?: string | null;
  isPublished?: boolean | null;
  comingSoon?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export const dynamic = 'force-dynamic';


  // Short-circuit when you intentionally disable DB queries
  if (process.env.DISABLE_DB_QUERIES === "true") {
    return (
      <main className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Books — New</h1>
        <p className="text-sm text-slate-600">Books service temporarily unavailable.</p>
      </main>
    );
  }

  // If no DB env var present, avoid querying
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return (
      <main className="max-w-6xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Books — New</h1>
        <p className="text-sm text-slate-600">No database configured.</p>
      </main>
    );
  }

  // Attempt DB query defensively; omit problematic columns (sales_metadata / seo*)
  let books: BookRow[] = [];
  try {
    const { db } = await import("@/lib/db");
    books = await db
      .select({
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
        // intentionally omitted: sales_metadata, seo, seo_title, seo_description
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      })
      .from(book)
      .orderBy(desc(book.createdAt))
      .limit(50);
  } catch (err) {
    // DB unreachable or schema mismatch: log and continue with empty list.
    // eslint-disable-next-line no-console
    console.error("NewBooksPage DB query failed:", err?.message ?? err);
    books = [];
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Books — New</h1>

      {books.length === 0 ? (
        <p>No books yet.</p>
      ) : (
        <ul className="space-y-4">
          {books.map((b) => (
            <li key={b.id} className="border-b pb-3">
              <Link href={`/books/${b.slug}`} className="text-lg font-semibold text-blue-600 hover:underline">
                {b.title}
              </Link>
              {b.subtitle1 ? <div className="text-sm text-gray-600">{b.subtitle1}</div> : null}
              <div className="text-xs text-gray-400 mt-1">
                {b.createdAt ? new Date(b.createdAt).toLocaleString() : ""}
                {b.comingSoon ? " • Coming soon" : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
