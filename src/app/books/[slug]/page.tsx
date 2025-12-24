export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { db } from '@/db'; // or '@/lib/db'
import { book, bookRetailerLink, retailer } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const b = await db.query.book.findFirst({
    where: eq(book.slug, params.slug),
  });
  return {
    title: b?.title || 'Book Not Found',
    description: b?.short_description || '',
  };
}

export default async function BookPage({ params }: { params: { slug: string } }) {
  const b = await db.query.book.findFirst({
    where: eq(book.slug, params.slug),
    with: {
      retailerLinks: {
        with: { retailer: true },
      },
    },
  });

  if (!b) notFound();

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-4">{b.title}</h1>
      {b.subtitle_1 && <p className="text-2xl mb-6">{b.subtitle_1}</p>}
      
      <img src={b.cover_image_url || '/placeholder-cover.jpg'} alt={b.title} className="w-full max-w-md mb-8" />
      
      <p className="mb-8">{b.long_description || b.short_description}</p>
      
      {b.coming_soon && <p className="text-red-600 font-bold mb-4">Coming Soon – December 2025</p>}
      
      <h2 className="text-2xl font-bold mb-4">Buy Now</h2>
      <ul className="space-y-4">
        {b.retailerLinks.map((link) => (
          <li key={link.id}>
            <a href={link.url} target="_blank" rel="noopener" className="btn-primary">
              Buy on {link.retailer.name}
            </a>
          </li>
        ))}
      </ul>

      {/* JSON-LD for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Book",
        name: b.title,
        author: { "@type": "Person", name: "Maya Allan" },
        description: b.short_description,
        image: b.cover_image_url,
        isbn: b.isbn || undefined,
        offers: b.retailerLinks.map(link => ({
          "@type": "Offer",
          url: link.url,
          seller: { "@type": "Organization", name: link.retailer.name },
        })),
      }) }} />
    </main>
  );
}
