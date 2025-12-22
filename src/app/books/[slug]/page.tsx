import React from "react";
import { notFound } from "next/navigation";

import { db } from "@/db";
import { book, bookRetailer, retailer } from "@/db/schema";
import { eq } from "drizzle-orm";

type Props = { params: { slug: string } };

export default async function BookPage({ params: { slug } }: Props) {
  // Fetch the book by slug
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
      isComingSoon: book.isComingSoon,
    })
    .from(book)
    .where(eq(book.slug, slug))
    .limit(1);

  const b = (rows as any[])[0];
  if (!b) {
    notFound();
  }

  // Fetch retailer links for the book
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
    .where(eq(bookRetailer.bookId, b.id))
    .orderBy(retailer.name);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const image = b.coverImageUrl || b.backCoverImageUrl || `${siteUrl}/og-default.png`;
  const pageUrl = `${siteUrl}/books/${encodeURIComponent(String(b.slug))}`;

  // JSON-LD structured data for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: b.title,
    image,
    description: b.shortDescription || b.longDescription || "",
    url: pageUrl,
    offers: (links || [])
      .filter((l: any) => l.isActive)
      .map((l: any) => ({
        "@type": "Offer",
        url: l.url,
        seller: { "@type": "Organization", name: l.retailerName },
      })),
  };

  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: 20, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 12 }}>{b.title}</h1>

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ minWidth: 260 }}>
          <img
            src={image}
            alt={`${b.title} cover`}
            style={{ width: 260, height: "auto", objectFit: "cover", borderRadius: 6 }}
            width={260}
          />
        </div>

        <div style={{ flex: 1 }}>
          {b.shortDescription ? <p>{b.shortDescription}</p> : null}

          {b.tags && Array.isArray(b.tags) && b.tags.length > 0 && (
            <p>
              <strong>Tags:</strong>{" "}
              {b.tags.map((t: string, i: number) => (
                <span key={i} style={{ marginRight: 8 }}>
                  #{t}
                </span>
              ))}
            </p>
          )}

          <h3>Buy / Retailers</h3>
          <ul>
            {(!links || links.length === 0) && <li>No retailer links published yet.</li>}
            {links.map((l: any) => (
              <li key={`${l.retailerId}-${l.url}`}>
                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.retailerName}
                </a>
                {l.retailerLogo ? (
                  <img
                    src={l.retailerLogo}
                    alt={`${l.retailerName} logo`}
                    style={{ height: 22, marginLeft: 8, verticalAlign: "middle" }}
                  />
                ) : null}
                {!l.isActive ? <em style={{ marginLeft: 8 }}> (inactive)</em> : null}
              </li>
            ))}
          </ul>

          {b.longDescription ? (
            <div style={{ marginTop: 18 }}>
              <h4>About this book</h4>
              <p>{b.longDescription}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
