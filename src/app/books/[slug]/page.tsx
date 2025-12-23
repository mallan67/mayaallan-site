import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  bookCanonicalUrl,
  buildBookJsonLd,
  fetchBookWithLinks,
  getBookCoverUrl,
} from "@/lib/books";

type Props = { params: { slug: string } };

export async function generateMetadata({ params: { slug } }: Props): Promise<Metadata> {
  const data = await fetchBookWithLinks(slug);
  if (!data) return { title: "Book not found | Maya Allan" };

  const title = data.book.seoTitle ?? `${data.book.title} | Maya Allan`;
  const description =
    data.book.seoDescription ??
    data.book.shortDescription ??
    data.book.longDescription ??
    "Book by Maya Allan";
  const image = getBookCoverUrl(data.book) ?? undefined;
  const url = bookCanonicalUrl(slug);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BookPage({ params: { slug } }: Props) {
  const payload = await fetchBookWithLinks(slug);
  if (!payload) {
    notFound();
  }

  const image = getBookCoverUrl(payload.book) ?? "/og-default.png";
  const jsonLd = buildBookJsonLd(payload);
  const activeRetailers = payload.retailers.filter((r) => r.isActive !== false && r.url);
  const inactiveRetailers = payload.retailers.filter((r) => r.isActive === false);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 md:py-16">
      <div className="grid md:grid-cols-[minmax(280px,320px)_1fr] gap-10">
        <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
          <img
            src={image}
            alt={`${payload.book.title} cover`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {payload.book.comingSoon ? (
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] bg-amber-100 text-amber-900 rounded-full">
                Coming soon
              </span>
            ) : null}
            {payload.book.isPublished ? (
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] bg-emerald-100 text-emerald-800 rounded-full">
                Published
              </span>
            ) : null}
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold leading-tight">
              {payload.book.title}
            </h1>
            {payload.book.subtitle1 ? (
              <p className="text-lg text-slate-700 font-serif">{payload.book.subtitle1}</p>
            ) : null}
            {payload.book.subtitle2 ? (
              <p className="text-base text-slate-600 font-serif">{payload.book.subtitle2}</p>
            ) : null}
          </div>

          {payload.book.shortDescription ? (
            <p className="text-base leading-relaxed text-slate-700">
              {payload.book.shortDescription}
            </p>
          ) : null}

          {payload.book.tags && payload.book.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {payload.book.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="space-y-2 pt-3">
            <h2 className="font-semibold text-sm uppercase tracking-[0.2em] text-slate-600">
              Retailers
            </h2>
            {activeRetailers.length === 0 ? (
              <p className="text-sm text-slate-600">Retail links coming soon.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {activeRetailers.map((r) => (
                  <a
                    key={`${r.slug}-${r.url}`}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full border border-slate-900/15 bg-slate-900/5 text-sm font-semibold hover:bg-slate-900/10 transition"
                  >
                    Buy on {r.name}
                  </a>
                ))}
              </div>
            )}
            {inactiveRetailers.length > 0 ? (
              <p className="text-xs text-slate-500">
                {inactiveRetailers.length} retailer link
                {inactiveRetailers.length > 1 ? "s are" : " is"} saved but inactive.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {payload.book.longDescription ? (
        <section className="mt-12 border-t border-slate-200 pt-8">
          <h3 className="font-serif text-2xl font-semibold mb-4">About this book</h3>
          <p className="text-base leading-relaxed text-slate-700">{payload.book.longDescription}</p>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
