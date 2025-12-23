import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-2 text-sm text-slate-600">
        Default: draft/hidden. Nothing appears publicly unless you publish/enable it.
      </p>
      <div className="mt-4 flex gap-3">
        <Link
          href="/admin/books/new"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-semibold"
        >
          + New book
        </Link>
        <Link
          href="/books"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold"
        >
          View public books
        </Link>
      </div>
    </div>
  );
}
