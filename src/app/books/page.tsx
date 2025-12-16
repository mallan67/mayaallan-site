export default async function BooksPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
      <h1 className="font-serif text-2xl md:text-3xl font-semibold mb-4">
        Books
      </h1>
      <p className="text-sm text-slate-700">
        This page will list all books once the Prisma backend and admin are wired
        to your database.
      </p>
    </div>
  );
}
