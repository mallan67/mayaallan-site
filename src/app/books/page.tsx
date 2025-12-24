// src/app/books/page.tsx
import { eq, desc , inArray } from "drizzle-orm";
import Link from "next/link";
import { book, bookRetailer, retailer } from "@/db/schema";


type BookWithLinks = {
  id: number;
  title: string;
  slug: string;
  comingSoon: boolean;
  allowDirectSale?: boolean;
  retailers: { retailer: string; url: string }[];
};

async function getBooks(): Promise<BookWithLinks[]> {
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return [];
  }
  const { db } = await import('@/lib/db');
  const rows = await db
    .select({
      id: book.id,
      title: book.title,
      slug: book.slug,
      comingSoon: book.comingSoon,
      allowDirectSale: book.allowDirectSale, // schema name is directSaleEnabled
    })
    .from(book)
    .where(eq(book.isPublished, true))
    .orderBy(desc(book.createdAt)) // note the parentheses
    .limit(20);

  const ids = rows.map((r: any) => r.id);
  if (ids.length === 0) return [];

  
  // Fetch active book-retailer link rows for the requested book ids
  const linksRows = await db
    .select({
      bookId: bookRetailer.bookId,
      url: bookRetailer.url,
      retailerId: bookRetailer.retailerId,
      isActive: bookRetailer.isActive,
    })
    .from(bookRetailer)
    .where(eq(bookRetailer.isActive, true))
    .where(inArray(bookRetailer.bookId, ids));

  // Fetch retailer data for the retailers referenced
  const retailerIds = [...new Set(linksRows.map((r: any) => r.retailerId))];
  const retailersMap = new Map<number, { name?: string; logoUrl?: string }>();

  if (retailerIds.length > 0) {
    const retailerRows = await db
      .select({
        id: retailer.id,
        name: retailer.name,
        logoUrl: retailer.logoUrl,
      })
      .from(retailer)
      .where(inArray(retailer.id, retailerIds));

    for (const rr of retailerRows) {
      retailersMap.set(rr.id, { name: rr.name, logoUrl: rr.logoUrl });
    }
  }

  // Merge retailer info into link rows
  const links = linksRows.map((lr: any) => ({
    bookId: lr.bookId,
    url: lr.url,
    retailerName: retailersMap.get(lr.retailerId)?.name ?? "",
    retailerLogo: retailersMap.get(lr.retailerId)?.logoUrl ?? null,
    isActive: lr.isActive,
    retailerId: lr.retailerId,
  }));

const linksByBook = new Map<number, { retailer: string; url: string }[]>();
  for (const l of links) {
    const arr = linksByBook.get(l.bookId) ?? [];
    arr.push({ retailer: l.retailerName, url: l.url });
    linksByBook.set(l.bookId, arr);
  }

  return rows.map((r: any) => ({
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
