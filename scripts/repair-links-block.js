const fs = require('fs');
const path = 'src/app/books/page.tsx';
if (!fs.existsSync(path)) {
  console.error('File not found:', path);
  process.exit(1);
}
let s = fs.readFileSync(path, 'utf8');

// Ensure drizzle helpers in import (and, inArray) are present
s = s.replace(/import\s+\{\s*([^}]*)\}\s+from\s+(['"])drizzle-orm\2\s*;?/m, (m, inner, q) => {
  const items = inner.split(',').map(x => x.trim()).filter(Boolean);
  const needed = ['and','inArray'];
  for (const n of needed) if (!items.includes(n)) items.push(n);
  // keep unique while preserving order
  const uniq = Array.from(new Set(items));
  return `import { ${uniq.join(', ')} } from ${q}drizzle-orm${q};`;
});

// Locate the block: we'll replace from the ".from(bookRetailer)" line up to just before "const linksByBook"
const startMarker = '.from(bookRetailer)';
const endMarker = 'const linksByBook';
const startIdx = s.indexOf(startMarker);
const endIdx = s.indexOf(endMarker, startIdx);
if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find the expected markers in', path);
  process.exit(1);
}

// Build canonical replacement block (two-step)
const replacement = `
.from(bookRetailer)
    .where(and(eq(bookRetailer.isActive, true), inArray(bookRetailer.bookId, ids)));

  // Fetch retailer rows referenced by those links
  const retailerIds = [...new Set(
    (await db
      .select({ retailerId: bookRetailer.retailerId })
      .from(bookRetailer)
      .where(inArray(bookRetailer.bookId, ids))
    ).map((r: any) => r.retailerId)
  )];

  const retailersMap = new Map<number, { name?: string; logoUrl?: string }>();
  if (retailerIds.length > 0) {
    const retailerRows = await db
      .select({
        id: retailer.id,
        name: retailer.name,
        logoUrl: retailer.logoUrl,
      })
      .from(retailer)
      .where(inArray(retailer.id, retailerIds));

    for (const rr of retailerRows) {
      retailersMap.set(rr.id, { name: rr.name, logoUrl: rr.logoUrl });
    }
  }

  // Build links array enriched with retailer data
  // We re-query the linksRows (active + inArray) so we have the link rows
  const linksRows = await db
    .select({
      bookId: bookRetailer.bookId,
      url: bookRetailer.url,
      retailerId: bookRetailer.retailerId,
      isActive: bookRetailer.isActive,
    })
    .from(bookRetailer)
    .where(and(eq(bookRetailer.isActive, true), inArray(bookRetailer.bookId, ids)));

  const links = linksRows.map((lr: any) => ({
    bookId: lr.bookId,
    url: lr.url,
    retailerName: retailersMap.get(lr.retailerId)?.name ?? '',
    retailerLogo: retailersMap.get(lr.retailerId)?.logoUrl ?? null,
    isActive: lr.isActive,
    retailerId: lr.retailerId,
  }));
`;

// Compose new file text: keep everything up to startIdx, add our replacement, then the rest starting at endIdx
const head = s.slice(0, startIdx);
const tail = s.slice(endIdx);
const newContent = head + replacement + '\n' + tail;
fs.writeFileSync(path, newContent, 'utf8');
console.log('Rewrote links block in', path);
