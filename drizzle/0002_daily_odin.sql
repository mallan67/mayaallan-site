ALTER TABLE "book" RENAME COLUMN "subtitle1" TO "subtitle_1";--> statement-breakpoint
ALTER TABLE "book" RENAME COLUMN "subtitle2" TO "subtitle_2";--> statement-breakpoint
ALTER TABLE "book" RENAME COLUMN "allow_direct_sale" TO "direct_sale_enabled";--> statement-breakpoint
ALTER TABLE "book" RENAME COLUMN "paypal_product_id" TO "paypal_button_id";--> statement-breakpoint
ALTER TABLE "book" RENAME COLUMN "is_coming_soon" TO "coming_soon";--> statement-breakpoint
ALTER TABLE "email_subscriber" RENAME COLUMN "subscribed_at" TO "created_at";--> statement-breakpoint
ALTER TABLE "event" RENAME COLUMN "is_online" TO "is_visible";--> statement-breakpoint
ALTER TABLE "media_item" RENAME COLUMN "kind" TO "type";--> statement-breakpoint
ALTER TABLE "media_item" RENAME COLUMN "storage_url" TO "file_url";--> statement-breakpoint
ALTER TABLE "retailer" RENAME COLUMN "logo_url" TO "icon_url";--> statement-breakpoint
ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_key_unique";--> statement-breakpoint
ALTER TABLE "book_retailer_link" DROP CONSTRAINT IF EXISTS "book_retailer_link_book_id_book_id_fk";
--> statement-breakpoint
ALTER TABLE "book_retailer_link" DROP CONSTRAINT IF EXISTS "book_retailer_link_retailer_id_retailer_id_fk";
--> statement-breakpoint
ALTER TABLE "book_retailer_link" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "book_retailer_link" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();--> statement-breakpoint
UPDATE "book_retailer_link" SET "created_at" = COALESCE("created_at", now()), "updated_at" = COALESCE("updated_at", now());--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='book_retailer_link' AND column_name='id') THEN
        ALTER TABLE "book_retailer_link" ADD COLUMN "id" serial;
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='book_retailer_link' AND column_name='id') THEN
        UPDATE "book_retailer_link"
        SET "id" = nextval(pg_get_serial_sequence('book_retailer_link','id'))
        WHERE "id" IS NULL;
        ALTER TABLE "book_retailer_link" ALTER COLUMN "id" SET NOT NULL;
    END IF;
END $$;--> statement-breakpoint
ALTER TABLE "admin_user" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "admin_user" ALTER COLUMN "password_hash" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "admin_user" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "isbn" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "cover_image_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "back_cover_image_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "stripe_product_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "book_retailer_link" ALTER COLUMN "url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "book_retailer_link" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "book_retailer_link" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "contact_submission" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contact_submission" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "contact_submission" ALTER COLUMN "source" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "contact_submission" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contact_submission" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "email_subscriber" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "start_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "start_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "end_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "media_item" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "media_item" ALTER COLUMN "title" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "media_item" ALTER COLUMN "cover_image_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "media_item" ALTER COLUMN "isbn" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "media_item" ALTER COLUMN "external_url" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "media_item" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "retailer" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "retailer" ALTER COLUMN "kind" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "retailer" ALTER COLUMN "kind" SET DEFAULT 'marketplace';--> statement-breakpoint
ALTER TABLE "retailer" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "site_settings" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='book' AND column_name='slug') THEN
        ALTER TABLE "book" ADD COLUMN "slug" text;
    END IF;
END $$;--> statement-breakpoint
UPDATE "book" SET "slug" = COALESCE(NULLIF("slug", ''), regexp_replace(lower(COALESCE("title", 'book')), '[^a-z0-9]+', '-', 'g')) WHERE "slug" IS NULL OR "slug" = '';--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN IF NOT EXISTS "seo_title" text;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN IF NOT EXISTS "seo_description" text;--> statement-breakpoint
ALTER TABLE "contact_submission" ADD COLUMN IF NOT EXISTS "meta" jsonb;--> statement-breakpoint
ALTER TABLE "media_item" ADD COLUMN IF NOT EXISTS "is_visible" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='retailer' AND column_name='slug') THEN
        ALTER TABLE "retailer" ADD COLUMN "slug" text;
    END IF;
END $$;--> statement-breakpoint
UPDATE "retailer" SET "slug" = COALESCE(NULLIF("slug", ''), regexp_replace(lower(COALESCE("name", 'retailer')), '[^a-z0-9]+', '-', 'g')) WHERE "slug" IS NULL OR "slug" = '';--> statement-breakpoint
ALTER TABLE "retailer" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "retailer" ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "seo_title" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "seo_description" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "og_image_url" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "accent_color" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "font_family" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "layout_width" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "button_style" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "is_visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "book_retailer_link" ADD CONSTRAINT "book_retailer_link_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_retailer_link" ADD CONSTRAINT "book_retailer_link_retailer_id_retailer_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "book_slug_unique" ON "book" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "book_slug_idx" ON "book" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_book_is_published" ON "book" USING btree ("is_published");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_book_retailer" ON "book_retailer_link" USING btree ("book_id","retailer_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "retailer_slug_unique" ON "retailer" USING btree ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "retailer_slug_idx" ON "retailer" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "book" DROP COLUMN IF EXISTS "copyright";--> statement-breakpoint
ALTER TABLE "book" DROP COLUMN IF EXISTS "stripe_enabled";--> statement-breakpoint
ALTER TABLE "book" DROP COLUMN IF EXISTS "paypal_enabled";--> statement-breakpoint
ALTER TABLE "media_item" DROP COLUMN IF EXISTS "duration_seconds";--> statement-breakpoint
ALTER TABLE "media_item" DROP COLUMN IF EXISTS "mime_type";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "key";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "value";
