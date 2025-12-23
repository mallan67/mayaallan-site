import Link from "next/link";
import { db } from "../../lib/db";
import { book } from "../../db/schema";

export default async function BooksPage() {
  // server-side DB call
  const books = await db.select().from(book).orderBy(book.created_at.desc).limit(50);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Books</h1>

      {books.length === 0 ? (
        <p>No books yet.</p>
      ) : (
        <ul className="space-y-4">
          {books.map((b) => (
            <li key={b.id} className="border-b pb-3">
              <Link href={`/books/${b.slug}`} className="text-lg font-semibold text-blue-600 hover:underline">
                {b.title}
              </Link>
              {b.subtitle_1 ? <div className="text-sm text-gray-600">{b.subtitle_1}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
