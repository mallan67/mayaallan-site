/* src/app/admin/books/new/page.tsx */
import dynamic from "next/dynamic";
import { requireAdminPage } from "@/lib/adminAuth";

const BookForm = dynamic(() => import("./BookForm"), { ssr: false });

export default async function AdminNewBookPage() {
  await requireAdminPage();
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">New Book</h1>
      <BookForm />
    </div>
  );
}
