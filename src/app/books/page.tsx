import Link from "next/link";

import { DEFAULT_BOOK_SLUG, fetchAllLiveBooks, getBookCoverUrl } from "@/lib/books";

export default async function BooksPage() {
  const books = await fetchAllLiveBooks();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold">Books</h1>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Data from Postgres via Drizzle
        </p>
      </div>

      {books.length === 0 ? (
        <p className="text-sm text-slate-700">No books published yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {books.map((b) => (
            <Link
              key={b.id}
              href={`/books/${b.slug || DEFAULT_BOOK_SLUG}`}
              className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition bg-white"
            >
              <div className="grid grid-cols-[120px_1fr] gap-4 p-4">
                <div className="rounded-lg overflow-hidden bg-slate-100 aspect-[3/4]">
                  <img
                    src={getBookCoverUrl(b) ?? "/og-default.png"}
                    alt={`${b.title} cover`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {b.comingSoon ? (
                      <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-amber-100 text-amber-900 rounded-full">
                        Coming soon
                      </span>
                    ) : null}
                    {b.isPublished ? (
                      <span className="text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                        Published
                      </span>
                    ) : null}
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-semibold leading-tight">{b.title}</h2>
                    {b.subtitle1 ? <p className="text-sm text-slate-700">{b.subtitle1}</p> : null}
                  </div>
                  {b.shortDescription ? (
                    <p className="text-sm text-slate-600">{b.shortDescription}</p>
                  ) : null}
                  {b.tags && b.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {b.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[11px] px-2 py-1 bg-slate-100 rounded-full">
                          #{tag}
                        </span>
                      ))}
                      {b.tags.length > 3 ? (
                        <span className="text-[11px] px-2 py-1 bg-slate-100 rounded-full">
                          +{b.tags.length - 3}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
