ALTER TABLE "book" ALTER COLUMN "tags" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "sales_metadata" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "book" ALTER COLUMN "seo" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "book_retailer_link" ALTER COLUMN "types" SET DEFAULT '[]'::jsonb;