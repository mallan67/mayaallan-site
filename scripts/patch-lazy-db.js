/**
 * scripts/patch-lazy-db.js
 * - Remove top-level db imports from three pages
 * - Inject runtime guards that return safe empty results if neither POSTGRES_URL nor DATABASE_URL are present
 * - Dynamically import '@/lib/db' only when DB is configured
 *
 * Usage: node scripts/patch-lazy-db.js
 */
const fs = require('fs');
const path = require('path');

function read(p){ return fs.existsSync(p) ? fs.readFileSync(p,'utf8') : null; }
function write(p, s){ fs.writeFileSync(p, s, 'utf8'); console.log('WROTE', p); }

function patchBooksPage(){
  const file = 'src/app/books/page.tsx';
  let s = read(file);
  if(!s) { console.log('missing', file); return; }

  // remove any top-level db import from "@/lib/db" or "@/db" or "../../lib/db"
  s = s.replace(/import\s+\{\s*db\s*\}\s+from\s+['"][^'"]*(?:\/lib\/db|\/db|lib\/db)['"];?\s*\n/mg, '');

  // inject guard inside async function getBooks(...)
  s = s.replace(/async function getBooks\s*\([^)]*\)\s*(?::\s*Promise<[^>]*>)?\s*\{/,
    match => `${match}\n  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {\n    return [];\n  }\n  const { db } = await import('@/lib/db');`
  );

  write(file, s);
}

function patchBookSlug(){
  const file = 'src/app/books/[slug]/page.tsx';
  let s = read(file);
  if(!s) { console.log('missing', file); return; }

  // remove top-level db import
  s = s.replace(/import\s+\{\s*db\s*\}\s+from\s+['"][^'"]*(?:\/lib\/db|\/db|lib\/db)['"];?\s*\n/mg, '');

  // inject guard inside async function getBookBySlug(...)
  s = s.replace(/async function getBookBySlug\s*\([^)]*\)\s*(?::\s*Promise<[^>]*>)?\s*\{/,
    match => `${match}\n  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {\n    return null;\n  }\n  const { db } = await import('@/lib/db');`
  );

  write(file, s);
}

function patchBooksNewPage(){
  const file = 'src/app/books/new/page.tsx';
  let s = read(file);
  if(!s) { console.log('missing', file); return; }

  // remove top-level db import variants
  s = s.replace(/import\s+\{\s*db\s*\}\s+from\s+['"][^'"]*(?:@\/db|@\/lib\/db|\.{1,2}\/lib\/db)['"];?\s*\n/mg, '');

  // Replace the block "const books = await db...limit(N);" (multi-line) with guarded version.
  // This regex looks for "const books = await db" and captures until the following ".limit(number);"
  const re = /const\s+books\s*=\s*await\s+db[\s\S]*?\.limit\(\s*\d+\s*\)\s*;/m;
  if(re.test(s)){
    const replacement =
`let books;
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    books = [];
  } else {
    const { db } = await import('@/lib/db');
    books = await db.select()
      .from(book)
      .orderBy(desc(book.createdAt))
      .limit(50);
  }`;
    s = s.replace(re, replacement);
  } else {
    console.log('Did not find a "const books = await db...limit(...)" block in', file);
  }

  write(file, s);
}

function showHead(file, lines=40){
  const s = read(file);
  if(!s){ console.log('no', file); return; }
  console.log('--- head of', file, '---');
  console.log(s.split(/\n/).slice(0,lines).join('\n'));
  console.log('--- end ---\n');
}

function main(){
  patchBooksPage();
  patchBookSlug();
  patchBooksNewPage();

  // show heads so you can verify
  showHead('src/app/books/page.tsx', 80);
  showHead('src/app/books/[slug]/page.tsx', 80);
  showHead('src/app/books/new/page.tsx', 120);

  console.log('DONE. If changes look good:');
  console.log('  git add src/app/books/page.tsx src/app/books/[slug]/page.tsx src/app/books/new/page.tsx');
  console.log('  git commit -m "chore(books): lazy-import db and guard missing POSTGRES_URL so build succeeds without DB"');
  console.log('  git push origin main');
}

main();
