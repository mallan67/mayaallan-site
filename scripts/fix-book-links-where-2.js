const fs = require('fs');
const p = 'src/app/books/page.tsx';
if (!fs.existsSync(p)) {
  console.error('File not found:', p);
  process.exit(1);
}
let s = fs.readFileSync(p, 'utf8');

const anchorLine = '.leftJoin(retailer, eq(retailer.id, bookRetailer.retailerId))';

// find the start of the anchor line (beginning of that line)
const i = s.indexOf(anchorLine);
if (i === -1) {
  console.error('Anchor leftJoin(...) not found in', p);
  process.exit(0);
}
const startLineIdx = s.lastIndexOf('\n', i) + 1;

// find where 'const linksByBook' begins (first occurrence after the anchor)
let constIdx = s.indexOf('const linksByBook', startLineIdx);
if (constIdx === -1) {
  // be tolerant: try indented version
  constIdx = s.indexOf('\\n  const linksByBook', startLineIdx);
  if (constIdx !== -1) {
    // shift to start of token (skip leading newline)
    constIdx = constIdx + 1;
  }
}
if (constIdx === -1) {
  console.error("Couldn't find 'const linksByBook' after leftJoin — aborting. File may differ from expected layout.");
  process.exit(1);
}

// Build canonical block (two-space indent to match file)
const newBlock =
"  .leftJoin(retailer, eq(retailer.id, bookRetailer.retailerId))\\n" +
"    .where(eq(bookRetailer.isActive, true))\\n" +
"    .where(inArray(bookRetailer.bookId, ids));\\n\\n";

// Compose new content: everything up to the start of the anchor line, then the new block, then the remainder starting at constIdx
const before = s.slice(0, startLineIdx);
const after = s.slice(constIdx); // starts at 'const linksByBook...'

const updated = before + newBlock + after;

// Remove any stray duplicate leftJoin that might remain elsewhere (defensive)
const cleaned = updated.replace(/\\n\\s*\\.leftJoin\\(retailer,\\s*eq\\(retailer\\.id,\\s*bookRetailer\\.retailerId\\)\\)\\n\\s*\\.leftJoin\\(retailer,\\s*eq\\(retailer\\.id,\\s*bookRetailer\\.retailerId\\)\\)/g,
                               '\\n  .leftJoin(retailer, eq(retailer.id, bookRetailer.retailerId))\\n');

if (cleaned === s) {
  console.log('No change required (already in expected form).');
  process.exit(0);
}

// write
fs.writeFileSync(p, cleaned, 'utf8');
console.log('Patched', p);
