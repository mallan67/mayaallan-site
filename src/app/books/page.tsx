// src/app/books/page.tsx
import Link from "next/link";
import { db } from "../../lib/db";
import { book } from "../../db/schema";
import { eq } from "drizzle-orm";

export default async function BooksPage() {
  // server-side DB call: only published books, newest first
  const books = await db
    .select()
    .from(book)
    .where(eq(book.isPublished, true))
    .orderBy(book.createdAt.desc)
    .limit(50);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Books</h1>

      {books.length === 0 ? (
        <p>No published books yet.</p>
      ) : (
        <ul className="space-y-4">
          {books.map((b) => (
            <li key={b.id} className="border-b pb-3">
              <Link href={`/books/${b.slug}`} className="text-lg font-semibold text-blue-600 hover:underline">
                {b.title}
              </Link>
              {b.subtitle1 ? <div className="text-sm text-gray-600">{b.subtitle1}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
