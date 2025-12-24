// src/app/admin/books/new/page.tsx
import React from "react";
import BookForm from "./BookForm";

export const metadata = {
  title: "Admin — New Book",
  description: "Create a new book (admin)",
};

export default function Page() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create a new book</h1>
      <BookForm />
    </div>
  );
}
