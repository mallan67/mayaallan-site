import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { book, bookRetailerLink, retailer } from "@/db/schema";
import { adminPasswordMatches } from "@/lib/adminAuth";
import BookForm from "./BookForm";

export type FormState = { status: "idle" | "success" | "error"; message?: string; slug?: string };

const retailerSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  kind: z.string().default("marketplace"),
  url: z.string().url(),
  logoUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  types: z.array(z.string()).optional(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createBookAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  "use server";

  if ((db as any).__is_dummy_db) {
    return { status: "error", message: "Database not configured. Set POSTGRES_URL/DATABASE_URL." };
  }
  if (!process.env.ADMIN_PASSWORD) {
    return { status: "error", message: "ADMIN_PASSWORD is not set in the environment." };
  }

  const adminPassword = formData.get("adminPassword")?.toString() ?? "";
  if (!adminPasswordMatches(adminPassword)) {
    return { status: "error", message: "Invalid admin password." };
  }

  const title = formData.get("title")?.toString().trim() ?? "";
  const slugInput = formData.get("slug")?.toString().trim();
  const slugValue = slugify(slugInput && slugInput.length > 0 ? slugInput : title);
  const subtitle1 = formData.get("subtitle1")?.toString().trim() || null;
  const subtitle2 = formData.get("subtitle2")?.toString().trim() || null;
  const shortDescription = formData.get("shortDescription")?.toString().trim() || null;
  const longDescription = formData.get("longDescription")?.toString().trim() || null;
  const coverImageUrl = formData.get("coverImageUrl")?.toString().trim() || null;
  const backCoverImageUrl = formData.get("backCoverImageUrl")?.toString().trim() || null;
  const seoTitle = formData.get("seoTitle")?.toString().trim() || null;
  const seoDescription = formData.get("seoDescription")?.toString().trim() || null;
  const comingSoon = formData.get("comingSoon") === "on";
  const isPublished = formData.get("isPublished") === "on";

  if (!title || !slugValue) {
    return { status: "error", message: "Title and slug are required." };
  }

  const tagsInput = formData.get("tags")?.toString() ?? "";
  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  let retailersPayload: z.infer<typeof retailerSchema>[] = [];
  const retailersJson = formData.get("retailersJson")?.toString() ?? "[]";
  try {
    const parsedJson = JSON.parse(retailersJson || "[]");
    retailersPayload = z.array(retailerSchema).parse(parsedJson);
  } catch (err) {
    return { status: "error", message: "Retailer links are invalid JSON." };
  }

  try {
    const savedBook = await db.transaction(async (tx) => {
      const [b] = await tx
        .insert(book)
        .values({
          slug: slugValue,
          title,
          subtitle1,
          subtitle2,
          shortDescription,
          longDescription,
          coverImageUrl,
          backCoverImageUrl,
          seoTitle,
          seoDescription,
          comingSoon,
          isPublished,
          directSaleEnabled: false,
          tags,
        })
        .onConflictDoUpdate({
          target: book.slug,
          set: {
            title,
            subtitle1,
            subtitle2,
            shortDescription,
            longDescription,
            coverImageUrl,
            backCoverImageUrl,
            seoTitle,
            seoDescription,
            comingSoon,
            isPublished,
            directSaleEnabled: false,
            tags,
            updatedAt: sql`now()`,
          },
        })
        .returning();

      const bookId = b.id;
      await tx.delete(bookRetailerLink).where(eq(bookRetailerLink.bookId, bookId));

      for (const r of retailersPayload) {
        const retailerSlug = slugify(r.slug);
        const [retRow] = await tx
          .insert(retailer)
          .values({
            name: r.name,
            slug: retailerSlug,
            kind: r.kind ?? "marketplace",
            iconUrl: r.logoUrl ?? null,
            isActive: r.isActive ?? true,
          })
          .onConflictDoUpdate({
            target: retailer.slug,
            set: {
              name: r.name,
              kind: r.kind ?? "marketplace",
              iconUrl: r.logoUrl ?? null,
              isActive: r.isActive ?? true,
              updatedAt: sql`now()`,
            },
          })
          .returning();

        await tx
          .insert(bookRetailerLink)
          .values({
            bookId,
            retailerId: retRow.id,
            url: r.url,
            isActive: r.isActive ?? true,
            types: r.types ?? [],
          })
          .onConflictDoUpdate({
            target: [bookRetailerLink.bookId, bookRetailerLink.retailerId],
            set: {
              url: r.url,
              isActive: r.isActive ?? true,
              types: r.types ?? [],
              updatedAt: sql`now()`,
            },
          });
      }

      return b;
    });

    revalidatePath("/books");
    revalidatePath(`/books/${slugValue}`);
    revalidatePath("/");

    return {
      status: "success",
      message: "Saved book and retailer links.",
      slug: savedBook.slug,
    };
  } catch (err: unknown) {
    console.error(err);
    return { status: "error", message: "Failed to save book. Check logs for details." };
  }
}

export default function AdminNewBookPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-12">
      <h1 className="text-2xl font-semibold mb-2">New Book</h1>
      <p className="text-sm text-slate-600 mb-6">
        Protected by <code className="px-1 py-0.5 bg-slate-100 rounded">ADMIN_PASSWORD</code>.
        Retailer links will be upserted for each slug.
      </p>
      <BookForm action={createBookAction} />
    </div>
  );
}
