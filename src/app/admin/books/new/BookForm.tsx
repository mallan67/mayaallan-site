'use client';

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";

import type { FormState } from "./page";

type AdminBookFormProps = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
};

export default function BookForm({ action }: AdminBookFormProps) {
  const [state, formAction] = useFormState(action, { status: "idle" });
  const [retailers, setRetailers] = useState([
    { name: "Amazon", slug: "amazon", kind: "marketplace", url: "", isActive: true },
    { name: "Lulu", slug: "lulu", kind: "print-on-demand", url: "", isActive: true },
  ]);

  const retailersJson = useMemo(() => JSON.stringify(retailers), [retailers]);

  useEffect(() => {
    if (state.status === "success" && state.slug) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium">Title</span>
          <input name="title" required className="w-full border rounded-xl p-3" placeholder="Book title" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Slug</span>
          <input
            name="slug"
            className="w-full border rounded-xl p-3"
            placeholder="guide-to-psilocybin-integration"
          />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium">Subtitle 1</span>
          <input name="subtitle1" className="w-full border rounded-xl p-3" placeholder="Primary subtitle" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Subtitle 2</span>
          <input name="subtitle2" className="w-full border rounded-xl p-3" placeholder="Secondary subtitle" />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium">Short description</span>
        <textarea
          name="shortDescription"
          rows={3}
          className="w-full border rounded-xl p-3"
          placeholder="Short marketing copy"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium">Long description</span>
        <textarea
          name="longDescription"
          rows={5}
          className="w-full border rounded-xl p-3"
          placeholder="Full book description"
        />
      </label>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium">Cover image URL</span>
          <input
            name="coverImageUrl"
            className="w-full border rounded-xl p-3"
            placeholder="https://..."
            type="url"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">Back cover image URL</span>
          <input
            name="backCoverImageUrl"
            className="w-full border rounded-xl p-3"
            placeholder="https://..."
            type="url"
          />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium">SEO title</span>
          <input name="seoTitle" className="w-full border rounded-xl p-3" placeholder="SEO title override" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium">SEO description</span>
          <input
            name="seoDescription"
            className="w-full border rounded-xl p-3"
            placeholder="Meta description override"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium">Tags (comma separated)</span>
        <input name="tags" className="w-full border rounded-xl p-3" placeholder="psychedelics,integration" />
      </label>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="comingSoon" className="h-4 w-4" />
          Coming soon
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="isPublished" className="h-4 w-4" />
          Published
        </label>
      </div>

      <RetailerInputs retailers={retailers} setRetailers={setRetailers} />
      <input type="hidden" name="retailersJson" value={retailersJson} />

      <label className="space-y-2 block">
        <span className="text-sm font-medium">ADMIN_PASSWORD</span>
        <input
          name="adminPassword"
          type="password"
          required
          className="w-full border rounded-xl p-3"
          placeholder="Enter admin password to save"
        />
      </label>

      {state.status === "error" ? <p className="text-sm text-red-600">{state.message}</p> : null}
      {state.status === "success" ? (
        <p className="text-sm text-emerald-700">
          Saved.{" "}
          {state.slug ? (
            <a className="underline" href={`/books/${state.slug}`} target="_blank" rel="noreferrer">
              View public page
            </a>
          ) : null}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-black/80 transition"
        >
          Save book
        </button>
        <a
          href="/admin"
          className="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold hover:bg-slate-50 transition inline-flex items-center"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

type RetailerInputsProps = {
  retailers: Array<{ name: string; slug: string; kind?: string; url: string; isActive?: boolean }>;
  setRetailers: (
    value:
      | Array<{ name: string; slug: string; kind?: string; url: string; isActive?: boolean }>
      | ((
          current: Array<{ name: string; slug: string; kind?: string; url: string; isActive?: boolean }>
        ) => Array<{ name: string; slug: string; kind?: string; url: string; isActive?: boolean }>)
  ) => void;
};

function RetailerInputs({ retailers, setRetailers }: RetailerInputsProps) {
  const updateRetailer = (index: number, field: string, value: string | boolean) => {
    setRetailers((prev) => {
      const next = [...prev];
      const current = next[index] ?? {};
      next[index] = { ...current, [field]: value };
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">Retailer links</h3>
        <button
          type="button"
          className="text-sm font-semibold text-blue-700"
          onClick={() =>
            setRetailers((prev) => [...prev, { name: "", slug: "", kind: "marketplace", url: "", isActive: true }])
          }
        >
          + Add retailer
        </button>
      </div>
      {retailers.length === 0 ? <p className="text-sm text-slate-600">No retailers added.</p> : null}
      <div className="space-y-3">
        {retailers.map((r, idx) => (
          <div key={`${r.slug}-${idx}`} className="border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="grid md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-600">Name</span>
                <input
                  className="w-full border rounded-lg p-2"
                  value={r.name}
                  onChange={(e) => updateRetailer(idx, "name", e.target.value)}
                  placeholder="Amazon"
                  required
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-600">Slug</span>
                <input
                  className="w-full border rounded-lg p-2"
                  value={r.slug}
                  onChange={(e) => updateRetailer(idx, "slug", e.target.value)}
                  placeholder="amazon"
                  required
                />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-600">Kind</span>
                <input
                  className="w-full border rounded-lg p-2"
                  value={r.kind ?? ""}
                  onChange={(e) => updateRetailer(idx, "kind", e.target.value)}
                  placeholder="marketplace"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-600">URL</span>
                <input
                  className="w-full border rounded-lg p-2"
                  value={r.url}
                  onChange={(e) => updateRetailer(idx, "url", e.target.value)}
                  placeholder="https://..."
                  required
                />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={r.isActive ?? true}
                  onChange={(e) => updateRetailer(idx, "isActive", e.target.checked)}
                />
                Active
              </label>
              <button
                type="button"
                className="text-xs text-red-600 font-semibold"
                onClick={() => setRetailers((prev) => prev.filter((_, i) => i !== idx))}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
