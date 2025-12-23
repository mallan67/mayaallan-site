import Link from "next/link";

import { fetchFeaturedBook, getBookCoverUrl } from "@/lib/books";

export default async function HomePage() {
  const featured = await fetchFeaturedBook();
  const retailers = featured.retailers.filter((r) => r.isActive !== false && r.url);
  const cover = getBookCoverUrl(featured.book) ?? "/og-default.png";

  return (
    <div className="pb-10">
      <section className="max-w-6xl mx-auto px-4 py-10 md:py-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="flex justify-center md:justify-start">
          <div className="w-48 md:w-64 aspect-[2/3] border border-slate-200 shadow-md rounded-md overflow-hidden bg-slate-50">
            <img src={cover} alt={`${featured.book.title} cover`} className="w-full h-full object-cover" />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-2">
            {featured.book.comingSoon ? "Coming Soon" : "Now Available"}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
            {featured.book.title}
          </h1>
          {featured.book.subtitle1 ? (
            <p className="mt-3 font-serif text-base md:text-lg text-slate-700">{featured.book.subtitle1}</p>
          ) : null}

          <div className="mt-4 text-sm text-slate-600 space-y-1">
            {featured.book.tags?.slice(0, 3).map((tag) => (
              <p key={tag}>#{tag}</p>
            ))}
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">By MAYA ALLAN</p>

          <div className="mt-6 flex flex-wrap gap-3 items-center">
            {retailers.length === 0 ? (
              <span className="px-5 py-2.5 text-sm font-semibold border border-black/70 bg-black/80 text-white rounded-full">
                Retail links coming soon
              </span>
            ) : (
              retailers.slice(0, 3).map((r) => (
                <a
                  key={r.slug}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 text-sm font-semibold border border-black/70 bg-black/80 text-white rounded-full hover:bg-black/60 transition"
                >
                  Buy on {r.name}
                </a>
              ))
            )}
          </div>

          {featured.book.shortDescription ? (
            <p className="mt-3 text-xs text-slate-500 max-w-md">{featured.book.shortDescription}</p>
          ) : null}
        </div>
      </section>

      {featured.book.longDescription ? (
        <section className="border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
            <h2 className="font-serif text-xl md:text-2xl font-semibold mb-4">About the Book</h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-700">
              {featured.book.longDescription}
            </p>
          </div>
        </section>
      ) : null}

      <section className="border-t border-slate-200" id="about">
        <div className="max-w-4xl mx-auto px-4 py-10 md:py-12 grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] gap-8 items-start">
          <div className="flex justify-center md:justify-start">
            <div className="w-32 h-32 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500">
              Author Photo
            </div>
          </div>
          <div>
            <h2 className="font-serif text-xl md:text-2xl font-semibold mb-3">About Maya Allan</h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-700 mb-3">
              Maya Allan is an author focused on integration, self-agency, and inner transformation. Her
              work is strictly educational and reflective, helping readers think through their experiences
              without promising cures or outcomes.
            </p>
            <Link
              href="/about"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:opacity-70"
            >
              Read full bio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
