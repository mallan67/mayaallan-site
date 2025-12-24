import { db } from "./db/connection";
import { book, retailer, bookRetailerLink } from "./db/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    // Upsert the book — use correct `set` (not set_)
    const [insertedBook] = await db.insert(book).values({
      slug: 'guide-to-psilocybin-integration',
      title: 'Guide to Psilocybin Integration',
      subtitle_1: '40 Real Scenarios for Navigating What You See, Feel & Experience',
      short_description: 'A compassionate, practical guide to integrating psilocybin experiences into everyday life.',
      long_description: 'This book offers 40 real-world scenarios to help navigate psilocybin journeys...',
      cover_image_url: 'https://via.placeholder.com/400x600?text=Maya+Allan+Cover',
      back_cover_image_url: 'https://via.placeholder.com/400x600?text=Back+Cover',
      coming_soon: true,
      created_at: new Date(),
      updated_at: new Date(),
    }).onConflictDoUpdate({
      target: book.slug,
      set: {
        title: 'Guide to Psilocybin Integration',
        subtitle_1: '40 Real Scenarios for Navigating What You See, Feel & Experience',
        short_description: 'A compassionate, practical guide to integrating psilocybin experiences into everyday life.',
        cover_image_url: 'https://via.placeholder.com/400x600?text=Maya+Allan+Cover',
        coming_soon: true,
        updated_at: new Date(),
      },
    }).returning({ id: book.id });

    console.log('Book inserted/updated — ID:', insertedBook.id);

    // Upsert retailers
    await db.insert(retailer).values([
      { name: 'Amazon', slug: 'amazon', kind: 'ebook_print' },
      { name: 'Lulu', slug: 'lulu', kind: 'print' },
    ]).onConflictDoNothing();

    const amazon = await db.select({ id: retailer.id }).from(retailer).where(eq(retailer.slug, 'amazon')).limit(1);
    const lulu = await db.select({ id: retailer.id }).from(retailer).where(eq(retailer.slug, 'lulu')).limit(1);

    const amazonId = amazon[0]?.id;
    const luluId = lulu[0]?.id;

    if (amazonId && luluId) {
      await db.insert(bookRetailerLink).values([
        { book_id: insertedBook.id, retailer_id: amazonId, url: 'https://www.amazon.com/dp/B0EXAMPLE' },
        { book_id: insertedBook.id, retailer_id: luluId, url: 'https://www.lulu.com/shop/example' },
      ]).onConflictDoNothing();
      console.log('Retailer links added!');
    } else {
      console.log('Warning: Retailers not found — check retailer table');
    }

    console.log('Test book fully seeded! Visit /books/guide-to-psilocybin-integration');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
