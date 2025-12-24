// src/app/books/new/page.tsx
import { desc } from "drizzle-orm";
import Link from "next/link";
import { book } from "@/db/schema";

export default async function NewBooksPage() {
  // server-side: fetch recent books but SELECT explicitly (omit salesMetadata)
  let books: any[];
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    books = [];
  } else {
    const { db } = await import('@/lib/db');
    books = await db.select()
      .from(book)
      .orderBy(desc(book.createdAt))
      .limit(50);
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Books — New</h1>

      {books.length === 0 ? (
        <p>No books yet.</p>
      ) : (
        <ul className="space-y-4">
          {books.map((b: any) => (
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
