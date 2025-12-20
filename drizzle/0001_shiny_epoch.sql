ALTER TABLE IF EXISTS public.book ALTER COLUMN "tags" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE IF EXISTS public.book ALTER COLUMN "sales_metadata" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE IF EXISTS public.book ALTER COLUMN "seo" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE IF EXISTS public.book_retailer_link ALTER COLUMN "types" SET DEFAULT '[]'::jsonb;