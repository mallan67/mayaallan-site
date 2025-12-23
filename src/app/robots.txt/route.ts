import { NextResponse } from "next/server";

import { getSiteUrl } from "@/lib/urls";

export async function GET() {
  const site = getSiteUrl();
  const body = `User-agent: *
Allow: /
Sitemap: ${site}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
