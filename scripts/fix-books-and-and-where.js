/**
 * scripts/fix-books-and-and-where.js
 * - ensure `and` is imported from drizzle-orm
 * - ensure the book_retailer query uses a single .where(and(...)) BEFORE .leftJoin(...)
 */
const fs = require('fs');
const p = 'src/app/books/page.tsx';
if (!fs.existsSync(p)) {
  console.error('File not found:', p);
  process.exit(1);
}
let s = fs.readFileSync(p,'utf8');

// 1) Fix import: ensure 'and' is present in drizzle-orm import
s = s.replace(/import\s+\{\s*([^}]*)\}\s+from\s+(['"])drizzle-orm\2\s*;?/m, (m, inner, q) => {
  const items = inner.split(',').map(x => x.trim()).filter(Boolean);
  // ensure unique
  const set = new Set(items);
  if (!set.has('and')) set.add('and');
  // keep original order for known helpers if present; otherwise append
  const ordered = Array.from(set);
  return `import { ${ordered.join(', ')} } from ${q}drizzle-orm${q};`;
});

// 2) Rewrite the book_retailer query region to put .where(and(...)) BEFORE .leftJoin
// Find the block that starts with ".from(bookRetailer)" and ends just before "const linksByBook"
const startMarker = '.from(bookRetailer)';
const endMarker = 'const linksByBook';
if (s.indexOf(startMarker) !== -1 && s.indexOf(endMarker) !== -1) {
  const startIdx = s.indexOf(startMarker);
  const endIdx = s.indexOf(endMarker, startIdx);
  const before = s.slice(0, startIdx);
  const after = s.slice(endIdx); // includes "const linksByBook..."
  // Build canonical replacement block: where(and(...)) BEFORE leftJoin
  const replacement = [
    ".from(bookRetailer)",
    "    .where(and(eq(bookRetailer.isActive, true), inArray(bookRetailer.bookId, ids)))",
    "    .leftJoin(retailer, eq(retailer.id, bookRetailer.retailerId))",
    ""
  ].join("\n");
  s = before + replacement + after;
} else {
  console.warn('Could not find expected markers in src/app/books/page.tsx; no block replaced.');
}

fs.writeFileSync(p, s, 'utf8');
console.log('Patched', p);
