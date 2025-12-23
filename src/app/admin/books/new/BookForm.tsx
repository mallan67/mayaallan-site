// src/app/admin/books/new/BookForm.tsx
'use client';

import React, { useRef, useState } from 'react';

/**
 * Client-side admin BookForm with upload-integration.
 *
 * - Uploads images to POST /api/admin/uploads (returns { ok, url })
 * - Submits JSON to POST /api/admin/books (existing admin API)
 *
 * NOTE: Admin must be logged in (session cookie) for both endpoints to work.
 */

type Retailer = { name: string; slug: string; kind?: string; url: string; isActive?: boolean };

export default function BookForm() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [subtitle1, setSubtitle1] = useState('');
  const [subtitle2, setSubtitle2] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [backCoverImageUrl, setBackCoverImageUrl] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [isbn, setIsbn] = useState('');
  const [allowDirectSale, setAllowDirectSale] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [retailers, setRetailers] = useState<Retailer[]>([
    { name: 'Amazon', slug: 'amazon', kind: 'marketplace', url: '', isActive: true },
  ]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hiddenCoverRef = useRef<HTMLInputElement | null>(null);
  const hiddenBackRef = useRef<HTMLInputElement | null>(null);

  function slugify(v: string) {
    return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  async function uploadFileToServer(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('filename', file.name);

      const res = await fetch('/api/admin/uploads', {
        method: 'POST',
        body: fd,
        credentials: 'same-origin', // ensure cookie/session
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error || 'Upload failed');
      }
      return json.url as string;
    } finally {
      setUploading(false);
    }
  }

  async function onCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    try {
      const url = await uploadFileToServer(file);
      setCoverImageUrl(url);
      if (hiddenCoverRef.current) hiddenCoverRef.current.value = url;
    } catch (err: any) {
      console.error(err);
      alert('Upload failed: ' + (err.message ?? String(err)));
    } finally {
      e.currentTarget.value = '';
    }
  }

  async function onBackCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    try {
      const url = await uploadFileToServer(file);
      setBackCoverImageUrl(url);
      if (hiddenBackRef.current) hiddenBackRef.current.value = url;
    } catch (err: any) {
      console.error(err);
      alert('Upload failed: ' + (err.message ?? String(err)));
    } finally {
      e.currentTarget.value = '';
    }
  }

  function addRetailer() {
    setRetailers((r) => [...r, { name: '', slug: '', kind: '', url: '', isActive: true }]);
  }
  function updateRetailer(i: number, field: keyof Retailer, value: any) {
    setRetailers((r) => {
      const next = [...r];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }
  function removeRetailer(i: number) {
    setRetailers((r) => r.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (!title.trim()) throw new Error('Title required');

      const payload = {
        title: title.trim(),
        slug: slug ? slugify(slug) : slugify(title),
        subtitle1: subtitle1 || null,
        subtitle2: subtitle2 || null,
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        isbn: isbn || null,
        shortDescription: shortDescription || null,
        longDescription: longDescription || null,
        coverImageUrl: coverImageUrl ?? null,
        backCoverImageUrl: backCoverImageUrl ?? null,
        allowDirectSale,
        isPublished,
        comingSoon,
        salesMetadata: {},
        retailers: retailers.map((r) => ({
          name: r.name,
          slug: r.slug,
          kind: r.kind ?? null,
          url: r.url,
          isActive: !!r.isActive,
        })),
      };

      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error ?? 'Save failed');
      }

      setMessage('Saved successfully.');
      // optionally redirect to edit page or public page
      if (json?.data?.slug) {
        const slugSaved = json.data.slug;
        // open the public page in a new tab
        window.open(`/books/${slugSaved}`, '_blank');
      }
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-sm font-semibold">Title</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border rounded" />
        </label>
        <label className="block">
          <div className="text-sm font-semibold">Slug (optional)</div>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full p-3 border rounded" />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-sm font-semibold">Subtitle 1</div>
          <input value={subtitle1} onChange={(e) => setSubtitle1(e.target.value)} className="w-full p-3 border rounded" />
        </label>
        <label className="block">
          <div className="text-sm font-semibold">Subtitle 2</div>
          <input value={subtitle2} onChange={(e) => setSubtitle2(e.target.value)} className="w-full p-3 border rounded" />
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-semibold">Short Description</div>
        <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={3} className="w-full p-3 border rounded"></textarea>
      </label>

      <label className="block">
        <div className="text-sm font-semibold">Long Description</div>
        <textarea value={longDescription} onChange={(e) => setLongDescription(e.target.value)} rows={6} className="w-full p-3 border rounded"></textarea>
      </label>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-semibold">Cover image</div>
          <input type="file" accept="image/*" onChange={onCoverFileChange} />
          <input ref={hiddenCoverRef} type="hidden" name="coverImageUrl" />
          {uploading ? <div className="text-sm text-slate-600 mt-2">Uploading cover…</div> : null}
          {coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImageUrl} alt="Cover preview" className="mt-2 w-40 h-56 object-cover rounded border" />
          ) : (
            <div className="mt-2 w-40 h-56 bg-slate-50 rounded border flex items-center justify-center text-xs text-slate-500">No cover</div>
          )}
        </div>

        <div>
          <div className="text-sm font-semibold">Back cover (optional)</div>
          <input type="file" accept="image/*" onChange={onBackCoverFileChange} />
          <input ref={hiddenBackRef} type="hidden" name="backCoverImageUrl" />
          {uploading ? <div className="text-sm text-slate-600 mt-2">Uploading…</div> : null}
          {backCoverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={backCoverImageUrl} alt="Back cover preview" className="mt-2 w-40 h-56 object-cover rounded border" />
          ) : (
            <div className="mt-2 w-40 h-56 bg-slate-50 rounded border flex items-center justify-center text-xs text-slate-500">No back cover</div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label>
          <div className="text-sm font-semibold">Tags (comma separated)</div>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full p-3 border rounded" />
        </label>
        <label>
          <div className="text-sm font-semibold">ISBN / Copyright</div>
          <input value={isbn} onChange={(e) => setIsbn(e.target.value)} className="w-full p-3 border rounded" />
        </label>
      </div>

      <div className="flex gap-6 items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={comingSoon} onChange={(e) => setComingSoon(e.target.checked)} />
          <span className="text-sm">Coming soon</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          <span className="text-sm">Published</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={allowDirectSale} onChange={(e) => setAllowDirectSale(e.target.checked)} />
          <span className="text-sm">Allow direct sale</span>
        </label>
      </div>

      <RetailerEditor retailers={retailers} setRetailers={setRetailers} />

      <div className="pt-3">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-black text-white rounded">
          {saving ? 'Saving…' : 'Save book'}
        </button>
        {message ? <span className="ml-4 text-sm text-slate-700">{message}</span> : null}
      </div>
    </form>
  );
}

/* ---------- Retailer editor subcomponent ---------- */

function RetailerEditor({ retailers, setRetailers }: { retailers: Retailer[]; setRetailers: (r: Retailer[] | ((c: Retailer[]) => Retailer[])) => void }) {
  function update(i: number, k: keyof Retailer, v: any) {
    setRetailers((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [k]: v };
      return next;
    });
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Retailer links</h3>
        <button type="button" onClick={() => setRetailers((r) => [...r, { name: '', slug: '', url: '', kind: '', isActive: true }])} className="text-sm text-blue-600">+ Add</button>
      </div>
      <div className="space-y-3">
        {retailers.map((r, i) => (
          <div key={`${r.slug}-${i}`} className="border rounded p-3">
            <div className="grid md:grid-cols-2 gap-3">
              <input className="p-2 border rounded" placeholder="Retailer name" value={r.name} onChange={(e) => update(i, 'name', e.target.value)} />
              <input className="p-2 border rounded" placeholder="Slug" value={r.slug} onChange={(e) => update(i, 'slug', e.target.value)} />
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <input className="p-2 border rounded" placeholder="Kind (marketplace/retailer)" value={r.kind ?? ''} onChange={(e) => update(i, 'kind', e.target.value)} />
              <input className="p-2 border rounded" placeholder="https://..." value={r.url} onChange={(e) => update(i, 'url', e.target.value)} />
            </div>
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!r.isActive} onChange={(e) => update(i, 'isActive', e.target.checked)} />
                <span className="text-sm">Active</span>
              </label>
              <button type="button" className="text-sm text-red-600" onClick={() => setRetailers((prev) => prev.filter((_, idx) => idx !== i))}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
