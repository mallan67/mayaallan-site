import React from "react";
import { redirect } from "next/navigation";

// Adjust db imports to your repo
import { db } from "@/db";
import { book, book_retailer_link } from "@/db/schema";

export default function NewBookPage() {
  async function createBook(formData: FormData) {
    "use server";

    const slug = (formData.get("slug") as string | null)?.trim();
    const title = (formData.get("title") as string | null)?.trim();
    if (!slug || !title) {
      throw new Error("slug and title are required");
    }

    const tagsRaw = (formData.get("tags") as string | null) ?? "";
    const tags = tagsRaw.split(",").map(s => s.trim()).filter(Boolean);

    const data = {
      slug,
      title,
      subtitle_1: (formData.get("subtitle_1") as string | null) ?? null,
      subtitle_2: (formData.get("subtitle_2") as string | null) ?? null,
      isbn: (formData.get("isbn") as string | null) ?? null,
      short_description: (formData.get("short_description") as string | null) ?? null,
      long_description: (formData.get("long_description") as string | null) ?? null,
      cover_image_url: (formData.get("cover_image_url") as string | null) ?? null,
      back_cover_image_url: (formData.get("back_cover_image_url") as string | null) ?? null,
      is_published: !!formData.get("is_published"),
      coming_soon: !!formData.get("coming_soon"),
      direct_sale_enabled: !!formData.get("direct_sale_enabled"),
      stripe_product_id: (formData.get("stripe_product_id") as string | null) ?? null,
      paypal_button_id: (formData.get("paypal_button_id") as string | null) ?? null,
      seo_title: (formData.get("seo_title") as string | null) ?? null,
      seo_description: (formData.get("seo_description") as string | null) ?? null,
      tags,
      sales_metadata: {},
      seo: {}
    };

    const inserted = await db.insert(book).values(data).returning();
    const newBook = Array.isArray(inserted) ? inserted[0] : inserted;

    const retailer_id = formData.get("retailer_id");
    const retailer_url = formData.get("retailer_url");
    if (retailer_id && retailer_url) {
      await db.insert(book_retailer_link).values({
        book_id: newBook.id,
        retailer_id: Number(retailer_id),
        url: String(retailer_url),
        is_active: true,
        types: []
      });
    }

    // redirect to admin listing (you may change)
    redirect("/admin/books");
  }

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: 20 }}>
      <h1>Add new book</h1>

      <form action={createBook} method="post">
        <div>
          <label>Slug (unique)</label>
          <input name="slug" required style={{ width: "100%" }} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Title</label>
          <input name="title" required style={{ width: "100%" }} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Subtitle 1</label>
          <input name="subtitle_1" style={{ width: "100%" }} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Subtitle 2</label>
          <input name="subtitle_2" style={{ width: "100%" }} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>ISBN</label>
          <input name="isbn" style={{ width: "100%" }} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Short description</label>
          <textarea name="short_description" rows={3} style={{ width: "100%" }} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Long description</label>
          <textarea name="long_description" rows={6} style={{ width: "100%" }} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Cover image URL</label>
          <input name="cover_image_url" placeholder="https://..." style={{ width: "100%" }} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Back cover image URL</label>
          <input name="back_cover_image_url" placeholder="https://..." style={{ width: "100%" }} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Tags (comma separated)</label>
          <input name="tags" style={{ width: "100%" }} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label><input type="checkbox" name="is_published" /> Published</label>
          <label style={{ marginLeft: 12 }}><input type="checkbox" name="coming_soon" /> Coming soon</label>
        </div>

        <div style={{ marginTop: 8 }}>
          <h4>Optional retailer</h4>
          <label>Retailer ID <input name="retailer_id" /></label>
          <label style={{ marginLeft: 12 }}>URL <input name="retailer_url" /></label>
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" style={{ padding: "8px 14px", background: "#0ea5e9", color: "white", border: "none", borderRadius: 4 }}>
            Create book
          </button>
        </div>
      </form>
    </div>
  );
}
