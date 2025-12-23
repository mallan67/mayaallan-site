import { NextResponse } from "next/server";

import { fetchAllLiveBooks } from "@/lib/books";
import { getSiteUrl } from "@/lib/urls";

export async function GET() {
  const site = getSiteUrl();
  const staticPaths = ["/", "/about", "/books", "/contact", "/legal", "/articles", "/events", "/media"];
  const books = await fetchAllLiveBooks();

  const urls = [
    ...staticPaths.map((p) => `${site}${p}`),
    ...books.map((b) => `${site}/books/${b.slug}`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `<url>
  <loc>${url}</loc>
</url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
