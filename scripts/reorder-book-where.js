const fs = require('fs');
const path = 'src/app/books/page.tsx';
if (!fs.existsSync(path)) {
  console.error('File not found:', path);
  process.exit(1);
}
let s = fs.readFileSync(path, 'utf8');

// 1) Reorder the where clauses: ensure eq(bookRetailer.isActive, true) comes first,
//    then inArray(bookRetailer.bookId, ids). This also canonicalizes the trailing semicolon.
const re = /(\.leftJoin\([^\)]*\)\s*)(?:\n|\r\n|\r)\s*\.where\(\s*inArray\(\s*bookRetailer\.bookId\s*,\s*ids\s*\)\s*\)\s*(?:\n|\r\n|\r)\s*\.where\(\s*eq\(\s*bookRetailer\.isActive\s*,\s*true\s*\)\s*\)\s*;?/g;
s = s.replace(re, (m, p1) => {
  return `${p1}.where(eq(bookRetailer.isActive, true)).where(inArray(bookRetailer.bookId, ids));`;
});

// 2) Remove any stray lines that are just a semicolon (leftover artifacts)
s = s.replace(/^\s*;\s*[\r\n]+/gm, '');

// 3) Write back if changed
if (s.indexOf(m = fs.readFileSync(path, 'utf8')) === -1) {
  // already changed? (safeguard)
}
fs.writeFileSync(path, s, 'utf8');
console.log('Patched', path);
