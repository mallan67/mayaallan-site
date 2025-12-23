// app/books/[slug]/page.tsx
import React from "react";
import { db } from "../../../src/db/index";
import { book, bookRetailer, retailer } from "../../../src/db/schema";

type Params = { params: { slug: string } };

async function getBookBySlug(slug: string) {
  const b = await db
    .select({
      id: book.id,
      title: book.title,
      slug: book.slug,
      subtitle1: book.subtitle1,
      subtitle2: book.subtitle2,
      shortDescription: book.shortDescription,
      longDescription: book.longDescription,
      seoTitle: book.seoTitle,
      seoDescription: book.seoDescription,
      comingSoon: book.comingSoon,
      allowDirectSale: book.allowDirectSale,
      isPublished: book.isPublished,
    })
    .from(book)
    .where(book.slug.eq(slug))
    .limit(1)
    .then((r) => r[0]);

  if (!b) return null;

  const links = await db
    .select({
      url: bookRetailer.url,
      retailerName: retailer.name,
    })
    .from(bookRetailer)
    .leftJoin(retailer, retailer.id.eq(bookRetailer.retailerId))
    .where(bookRetailer.bookId.eq(b.id))
    .where(bookRetailer.isActive.eq(true))
    .where(retailer.isActive.eq(true));

  return { ...b, retailers: links };
}

export default async function Page({ params }: Params) {
  const slug = params.slug;
  const bookData = await getBookBySlug(slug);

  if (!bookData || !bookData.isPublished) {
    return <div className="p-8">Book not found or not published.</div>;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: bookData.title,
    about: bookData.shortDescription ?? bookData.seoDescription ?? "",
    author: { "@type": "Person", name: "Maya Allan" },
    url: `https://mayaallan.com/books/${bookData.slug}`,
  };

  return (
    <main className="max-w-4xl mx-auto p-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1 className="font-serif text-3xl">{bookData.title}</h1>
      {bookData.subtitle1 ? <p className="text-sm text-slate-600">{bookData.subtitle1}</p> : null}
      <div className="mt-4 text-slate-700">
        <p>{bookData.shortDescription}</p>
      </div>

      <div className="mt-6">
        {bookData.retailers && bookData.retailers.length > 0 ? (
          <div className="flex gap-3">
            {bookData.retailers.map((r: any, i: number) => (
              <a key={i} className="text-blue-600 underline" href={r.url} target="_blank" rel="noreferrer">
                Buy on {r.retailerName}
              </a>
            ))}
          </div>
        ) : bookData.allowDirectSale ? (
          <div>Direct sale available</div>
        ) : bookData.comingSoon ? (
          <span className="inline-block px-3 py-1 bg-black text-white rounded">Coming Soon</span>
        ) : (
          <div>Currently not available</div>
        )}
      </div>
    </main>
  );
}
