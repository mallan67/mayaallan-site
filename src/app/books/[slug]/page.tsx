// app/books/[slug]/page.tsx
import React from "react";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { book, bookRetailer, retailer } from "@/db/schema";
import { eq } from "drizzle-orm";

type Props = { params: { slug: string } };

export default async function BookPage({ params: { slug } }: Props) {
  // 1) Fetch the book
  const rows = await db
    .select({
      id: book.id,
      slug: book.slug,
      title: book.title,
      shortDescription: book.shortDescription,
      longDescription: book.longDescription,
      coverImageUrl: book.coverImageUrl,
      backCoverImageUrl: book.backCoverImageUrl,
      tags: book.tags,
      isPublished: book.isPublished,
      comingSoon: book.comingSoon,
    })
    .from(book)
    .where(eq(book.slug, slug))
    .limit(1);

  const b = (rows as any[])[0];
  if (!b) return notFound();

  // 2) Fetch retailer links for this book (only active links)
  const links = await db
    .select({
      url: bookRetailer.url,
      isActive: bookRetailer.isActive,
      retailerId: retailer.id,
      retailerName: retailer.name,
      retailerLogo: retailer.logoUrl,
    })
    .from(bookRetailer)
    .innerJoin(retailer, eq(retailer.id, bookRetailer.retailerId))
    .where(eq(bookRetailer.bookId, b.id));

  // 3) site URL and fallback cover
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
  const cover = b.coverImageUrl ?? `${siteUrl}/og-default.png`;
  const backCover = b.backCoverImageUrl ?? null;

  // 4) JSON-LD for the book (simple Book + Offers)
  const offers = (links || [])
    .filter((l: any) => l.isActive)
    .map((l: any) => ({
      "@type": "Offer",
      "url": l.url,
      "seller": {
        "@type": "Organization",
        "name": l.retailerName
      }
    }));

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": b.title,
    "image": [cover].concat(backCover ? [backCover] : []),
    "description": b.shortDescription ?? b.longDescription ?? "",
    "url": `${siteUrl}/books/${b.slug}`,
  };
  if (offers.length) jsonLd.offers = offers;

  // 5) Render page
  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: 20, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      {/* JSON-LD for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div style={{ minWidth: 240 }}>
            <img
              src={cover}
              alt={b.title}
              style={{ width: 240, height: "auto", objectFit: "cover", borderRadius: 6, boxShadow: "0 6px 18px rgba(0,0,0,0.12)" }}
            />
            {backCover ? (
              <div style={{ marginTop: 8 }}>
                <img src={backCover} alt={`${b.title} — back cover`} style={{ width: 240, height: "auto", objectFit: "cover", borderRadius: 6 }} />
              </div>
            ) : null}
          </div>

          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0 }}>{b.title}</h1>
            {b.shortDescription ? <p style={{ color: "#444" }}>{b.shortDescription}</p> : null}
            {b.longDescription ? <div style={{ marginTop: 12, color: "#333" }}>{b.longDescription}</div> : null}

            {Array.isArray(b.tags) && b.tags.length ? (
              <div style={{ marginTop: 12 }}>
                {b.tags.map((t: string) => (
                  <span key={t} style={{ display: "inline-block", marginRight: 8, marginBottom: 8, padding: "4px 8px", background: "#f3f4f6", borderRadius: 6, fontSize: 13 }}>
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            <div style={{ marginTop: 18 }}>
              <h3 style={{ margin: "8px 0" }}>Buy / Retailers</h3>
              {links && links.length ? (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {links.map((l: any) => (
                    <li key={l.retailerId} style={{ marginBottom: 10 }}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        {l.retailerLogo ? <img src={l.retailerLogo} alt={l.retailerName} style={{ width: 28, height: 28, objectFit: "contain" }} /> : null}
                        <span style={{ fontWeight: 600 }}>{l.retailerName}</span>
                        <span style={{ color: "#666", marginLeft: 8, fontSize: 13 }}>{new URL(l.url).hostname.replace("www.", "")}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ color: "#666" }}>No retailers listed for this book.</div>
              )}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
