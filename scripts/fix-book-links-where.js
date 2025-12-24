const fs = require('fs');
const p = 'src/app/books/page.tsx';
if (!fs.existsSync(p)) {
  console.error('File not found:', p);
  process.exit(1);
}
let s = fs.readFileSync(p, 'utf8');

const anchor = '.leftJoin(retailer, eq(retailer.id, bookRetailer.retailerId))';

const i = s.indexOf(anchor);
if (i === -1) {
  console.error('Anchor leftJoin(...) not found in', p);
  process.exit(0);
}

// find end of the anchor line
const afterAnchorLineEnd = s.indexOf('\n', i);
if (afterAnchorLineEnd === -1) {
  console.error('Unexpected file format (no newline after leftJoin)', p);
  process.exit(1);
}

// find the start of the next section 'const linksByBook' to replace what's in between
const constIdx = s.indexOf('\n  const linksByBook', afterAnchorLineEnd);
if (constIdx === -1) {
  // try without leading two spaces (be tolerant)
  constIdx = s.indexOf('\nconst linksByBook', afterAnchorLineEnd);
}
if (constIdx === -1) {
  console.error("Couldn't find 'const linksByBook' after leftJoin — aborting. File may differ from expected layout.");
  process.exit(1);
}

// Build the canonical block we want
const newBlock =
`  .leftJoin(retailer, eq(retailer.id, bookRetailer.retailerId))
    .where(eq(bookRetailer.isActive, true))
    .where(inArray(bookRetailer.bookId, ids));\n\n`;

// Compose new file: up to end of leftJoin line, then newBlock, then the rest starting at constIdx+1 (preserve leading newline)
const before = s.slice(0, afterAnchorLineEnd + 1);
const after = s.slice(constIdx + 1); // +1 to skip the newline, we will preserve one newline in newBlock
const updated = before + newBlock + after;

// Write only if changed
if (updated === s) {
  console.log('No change required (already in expected form).');
  process.exit(0);
}
fs.writeFileSync(p, updated, 'utf8');
console.log('Patched', p);
