import { NextResponse } from "next/server";

// Adjust these to match your repo layout
import { db } from "@/db"; // <-- change if your db client lives elsewhere
import { book, book_retailer_link } from "@/db/schema";

type RetailerInput = {
  retailer_id: number;
  url: string;
  is_active?: boolean;
  types?: string[]; // array of strings (jsonb)
};

type CreateBookBody = {
  slug: string;
  title: string;
  subtitle_1?: string | null;
  subtitle_2?: string | null;
  isbn?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  cover_image_url?: string | null;
  back_cover_image_url?: string | null;
  is_published?: boolean;
  coming_soon?: boolean;
  direct_sale_enabled?: boolean;
  stripe_product_id?: string | null;
  paypal_button_id?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  tags?: string[]; // array -> jsonb
  sales_metadata?: Record<string, any>;
  seo?: Record<string, any>;
  retailers?: RetailerInput[];
};

export async function POST(req: Request) {
  try {
    // Simple header auth for now. Replace with your session/auth check.
    const provided = req.headers.get("x-admin-secret") ?? "";
    if (!process.env.ADMIN_PASSWORD || provided !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as CreateBookBody;
    if (!body?.slug || !body?.title) {
      return NextResponse.json({ error: "slug and title required" }, { status: 400 });
    }

    const tags = Array.isArray(body.tags) ? body.tags : [];
    const sales_metadata = body.sales_metadata ?? {};
    const seo = body.seo ?? {};

    // Insert book
    const inserted = await db.insert(book).values({
      slug: body.slug,
      title: body.title,
      subtitle_1: body.subtitle_1 ?? null,
      subtitle_2: body.subtitle_2 ?? null,
      isbn: body.isbn ?? null,
      short_description: body.short_description ?? null,
      long_description: body.long_description ?? null,
      cover_image_url: body.cover_image_url ?? null,
      back_cover_image_url: body.back_cover_image_url ?? null,
      is_published: !!body.is_published,
      coming_soon: !!body.coming_soon,
      direct_sale_enabled: !!body.direct_sale_enabled,
      stripe_product_id: body.stripe_product_id ?? null,
      paypal_button_id: body.paypal_button_id ?? null,
      seo_title: body.seo_title ?? null,
      seo_description: body.seo_description ?? null,
      tags,
      sales_metadata,
      seo
    }).returning();

    const newBook = Array.isArray(inserted) ? inserted[0] : inserted;

    // Insert retailer links if provided
    if (Array.isArray(body.retailers) && body.retailers.length > 0) {
      for (const r of body.retailers) {
        await db.insert(book_retailer_link).values({
          book_id: newBook.id,
          retailer_id: r.retailer_id,
          url: r.url,
          is_active: r.is_active ?? true,
          types: r.types ?? []
        });
      }
    }

    return NextResponse.json({ success: true, book: newBook });
  } catch (err: any) {
    console.error("admin/books POST error:", err);
    return NextResponse.json({ error: err?.message ?? "server error" }, { status: 500 });
  }
}
