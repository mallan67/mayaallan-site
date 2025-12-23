/* scripts/create-sample-book.js
   Upserts a published sample book "psilocybin-integration" and links Amazon/Lulu retailers.
   Run with:
     POSTGRES_URL=... NEXT_PUBLIC_SITE_URL=http://localhost:3000 node scripts/create-sample-book.js
*/
const postgres = require('postgres');

const POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

if (!POSTGRES_URL) {
  console.error('Set POSTGRES_URL (or DATABASE_URL) before running');
  process.exit(1);
}

const sql = postgres(POSTGRES_URL, { prepare: false });

async function main() {
  const slug = 'psilocybin-integration';
  const title = 'Psilocybin Integration Guide';
  const cover = `${SITE.replace(/\/$/, '')}/images/cover.png`;
  const shortDescription = 'An educational companion for integrating psychedelic experiences into day-to-day life.';
  const longDescription = 'Full description and details for the Psilocybin Integration Guide.';

  // Example retailer URLs — replace with your product links if available
  const retailers = [
    { name: 'Amazon', kind: 'marketplace', url: 'https://www.amazon.com/dp/EXAMPLE' },
    { name: 'Lulu', kind: 'print-on-demand', url: 'https://www.lulu.com/example' },
  ];

  try {
    await sql.begin(async (tx) => {
      // Upsert retailers by name
      const retailerIds = [];
      for (const r of retailers) {
        const found = await tx`select id from retailer where name = ${r.name} limit 1`;
        let rid;
        if (found.length > 0) {
          rid = found[0].id;
        } else {
          const inserted = await tx`
            insert into retailer (name, kind, logo_url, created_at, updated_at)
            values (${r.name}, ${r.kind}, ${null}, now(), now()) returning id
          `;
          rid = inserted[0].id;
        }
        retailerIds.push({ id: rid, url: r.url });
      }

      // Upsert book by slug
      const existing = await tx`select id from book where slug = ${slug} limit 1`;
      let bookId;
      if (existing.length > 0) {
        bookId = existing[0].id;
        await tx`
          update book set
            title = ${title},
            subtitle_1 = ${null},
            subtitle_2 = ${null},
            tags = ${JSON.stringify([])},
            isbn = ${null},
            short_description = ${shortDescription},
            long_description = ${longDescription},
            cover_image_url = ${cover},
            back_cover_image_url = ${null},
            direct_sale_enabled = ${false},
            stripe_product_id = ${null},
            paypal_button_id = ${null},
            is_published = ${true},
            coming_soon = ${false},
            sales_metadata = ${JSON.stringify({})},
            seo = ${JSON.stringify({})},
            seo_title = ${null},
            seo_description = ${null},
            updated_at = now()
          where id = ${bookId}
        `;
      } else {
        const inserted = await tx`
          insert into book
            (slug, title, subtitle_1, subtitle_2, tags, isbn, short_description, long_description, cover_image_url, back_cover_image_url, direct_sale_enabled, stripe_product_id, paypal_button_id, is_published, coming_soon, sales_metadata, seo, seo_title, seo_description, created_at, updated_at)
          values
            (${slug}, ${title}, ${null}, ${null}, ${JSON.stringify([])}, ${null}, ${shortDescription}, ${longDescription}, ${cover}, ${null}, ${false}, ${null}, ${null}, ${true}, ${false}, ${JSON.stringify({})}, ${JSON.stringify({})}, ${null}, ${null}, now(), now())
          returning id
        `;
        bookId = inserted[0].id;
      }

      // Remove existing links for this book (we will re-create)
      await tx`delete from book_retailer_link where book_id = ${bookId}`;

      // Create book -> retailer links (active)
      for (const r of retailerIds) {
        await tx`
          insert into book_retailer_link (book_id, retailer_id, url, is_active, types, created_at, updated_at)
          values (${bookId}, ${r.id}, ${r.url}, true, ${JSON.stringify([])}, now(), now())
        `;
      }

      console.log('Success: book upserted (id=', bookId, ') and retailers linked.');
    });
  } catch (err) {
    console.error('Error creating sample book:', err);
  } finally {
    await sql.end({ timeout: 5 }); // close connection
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
