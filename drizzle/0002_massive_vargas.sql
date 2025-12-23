ALTER TABLE "book" RENAME COLUMN "subtitle1" TO "subtitle_1";--> statement-breakpoint
ALTER TABLE "book" RENAME COLUMN "subtitle2" TO "subtitle_2";--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "slug" varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "direct_sale_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "paypal_button_id" varchar(255);--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "coming_soon" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "seo_title" text;--> statement-breakpoint
ALTER TABLE "book" ADD COLUMN "seo_description" text;--> statement-breakpoint
ALTER TABLE "book" DROP COLUMN "copyright";--> statement-breakpoint
ALTER TABLE "book" DROP COLUMN "allow_direct_sale";--> statement-breakpoint
ALTER TABLE "book" DROP COLUMN "stripe_enabled";--> statement-breakpoint
ALTER TABLE "book" DROP COLUMN "paypal_enabled";--> statement-breakpoint
ALTER TABLE "book" DROP COLUMN "paypal_product_id";--> statement-breakpoint
ALTER TABLE "book" DROP COLUMN "is_coming_soon";