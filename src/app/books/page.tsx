// src/app/books/page.tsx (server component)
import React from 'react';
import { db } from '../../lib/db';
import { book } from '../../db/schema'; // your Drizzle schema

export default async function Page() {
  const rows = await db.select().from(book).orderBy(book.created_at.desc()).limit(50);

  return (
    <main>
      <h1>Books</h1>
      {rows.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <ul>
          {rows.map((r) => (
            <li key={r.id}>
              <strong>{r.title}</strong> — <em>{r.slug}</em> — {r.coming_soon ? 'Coming soon' : 'Available'}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
