const fs = require('fs');
const p = 'src/app/books/[slug]/page.tsx';
if (!fs.existsSync(p)) {
  console.error('File not found:', p);
  process.exit(1);
}
let s = fs.readFileSync(p, 'utf8');

// Look for the function signature and inject DB guard + dynamic import
const sig = /export\s+default\s+async\s+function\s+BookPage\s*\(\s*\{\s*params\s*:\s*\{\s*slug\s*\}\s*\}\s*:\s*Props\s*\)\s*\{/;
if (!sig.test(s)) {
  console.error('Could not find standard function signature in', p);
  process.exit(1);
}

const injection = `export default async function BookPage({ params: { slug } }: Props) {
  // If no DB configured, render a safe fallback so build/prerendering succeeds.
  if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
    return (
      <main style={{ maxWidth: 900, margin: "2rem auto", padding: 20 }}>
        <h1>Book</h1>
        <p>Book data is not available because the database is not configured.</p>
        <p>Slug: <strong>{slug}</strong></p>
      </main>
    );
  }

  // Dynamically import DB only at runtime when DB config is present
  const { db } = await import('@/lib/db');`;

s = s.replace(sig, injection);

// Write back
fs.writeFileSync(p, s, 'utf8');
console.log('Patched', p);
