// src/app/books/page.tsx
import Link from "next/link";
import { db } from "@/db";
import { book, bookRetailer, retailer } from "@/db/schema";
import { eq } from "drizzle-orm";

type BookWithLinks = {
  id: number;
  title: string;
  slug: string;
  comingSoon: boolean;
  allowDirectSale?: boolean;
  retailers: { retailer: string; url: string }[];
};

async function getBooks(): Promise<BookWithLinks[]> {
  const rows = await db
    .select({
      id: book.id,
      title: book.title,
      slug: book.slug,
      comingSoon: book.comingSoon,
      allowDirectSale: book.directSaleEnabled, // schema name is directSaleEnabled
    })
    .from(book)
    .where(eq(book.isPublished, true))
    .orderBy(desc(book.createdAt)) // note the parentheses
    .limit(20);

  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];

  const links = await db
    .select({
      bookId: bookRetailer.bookId,
      url: bookRetailer.url,
      retailerName: retailer.name,
      isActive: bookRetailer.isActive,
    })
    .from(bookRetailer)
    .leftJoin(retailer, eq(retailer.id, bookRetailer.retailerId))
    .where(bookRetailer.bookId.in(ids))
    .where(eq(bookRetailer.isActive, true))
    .where(eq(retailer.isActive, true));

  const linksByBook = new Map<number, { retailer: string; url: string }[]>();
  for (const l of links) {
    const arr = linksByBook.get(l.bookId) ?? [];
    arr.push({ retailer: l.retailerName, url: l.url });
    linksByBook.set(l.bookId, arr);
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    comingSoon: !!r.comingSoon,
    allowDirectSale: !!r.allowDirectSale,
    retailers: linksByBook.get(r.id) ?? [],
  }));
}

export default async function Page() {
  const books = await getBooks();

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="font-serif text-3xl mb-6">Books</h1>
      <div className="grid gap-6">
        {books.length === 0 ? (
          <p>No published books yet.</p>
        ) : (
          books.map((b) => (
            <article key={b.id} className="border p-4 rounded">
              <h2 className="font-serif text-xl">
                <Link href={`/books/${b.slug}`}>{b.title}</Link>
              </h2>

              <div className="mt-2 text-sm">
                {b.retailers.length === 0 && !b.allowDirectSale ? (
                  b.comingSoon ? (
                    <span className="inline-block px-3 py-1 bg-black text-white rounded">Coming Soon</span>
                  ) : (
                    <span className="text-slate-600">Not currently available</span>
                  )
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    {b.retailers.map((r, i) => (
                      <a key={i} className="text-blue-600 underline" href={r.url} target="_blank" rel="noreferrer">
                        Buy on {r.retailer}
                      </a>
                    ))}
                    {b.allowDirectSale ? <span className="text-slate-700">Direct sale enabled</span> : null}
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
