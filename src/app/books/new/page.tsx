// src/app/books/new/page.tsx
'use client';
import { useState } from 'react';

export default function NewBookPage() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [coming, setComing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, coming_soon: coming }),
    });

    if (!res.ok) {
      alert('Failed to save');
    } else {
      // redirect back to list
      window.location.href = '/books';
    }
    setSaving(false);
  }

  return (
    <main>
      <h1>Add Book</h1>
      <form onSubmit={onSubmit}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Slug
          <input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </label>
        <label>
          Coming soon
          <input type="checkbox" checked={coming} onChange={(e) => setComing(e.target.checked)} />
        </label>
        <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </form>
    </main>
  );
}
