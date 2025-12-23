// src/app/books/NEW/page.tsx
import { desc } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { book } from "@/db/schema";

export default async function NewBooksPage() {
  const books = await db
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
      seo: book.seo,
      seoTitle: book.seoTitle,
      seoDescription: book.seoDescription,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    })
    .from(book)
    .orderBy(desc(book.createdAt))
    .limit(50);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Books — NEW</h1>

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
