CREATE TABLE "admin_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" varchar(256) NOT NULL,
	"display_name" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "admin_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "book" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"subtitle1" varchar(500),
	"subtitle2" varchar(500),
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"isbn" varchar(50),
	"copyright" varchar(1000),
	"short_description" text,
	"long_description" text,
	"cover_image_url" varchar(1000),
	"back_cover_image_url" varchar(1000),
	"allow_direct_sale" boolean DEFAULT false NOT NULL,
	"stripe_enabled" boolean DEFAULT false NOT NULL,
	"stripe_product_id" varchar(255),
	"paypal_enabled" boolean DEFAULT false NOT NULL,
	"paypal_product_id" varchar(255),
	"is_published" boolean DEFAULT false NOT NULL,
	"is_coming_soon" boolean DEFAULT false NOT NULL,
	"sales_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"seo" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "book_retailer_link" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"retailer_id" integer NOT NULL,
	"url" varchar(2000) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"types" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contact_submission" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200),
	"email" varchar(320) NOT NULL,
	"message" text,
	"source" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_subscriber" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "email_subscriber_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp,
	"location" text,
	"url" varchar(2000),
	"is_online" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" varchar(20) NOT NULL,
	"title" varchar(500),
	"description" text,
	"cover_image_url" varchar(1000),
	"isbn" varchar(50),
	"storage_url" varchar(2000),
	"external_url" varchar(2000),
	"duration_seconds" integer,
	"mime_type" varchar(200),
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "retailer" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"kind" varchar(100) NOT NULL,
	"logo_url" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(200) NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "book_retailer_link" ADD CONSTRAINT "book_retailer_link_book_id_book_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."book"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_retailer_link" ADD CONSTRAINT "book_retailer_link_retailer_id_retailer_id_fk" FOREIGN KEY ("retailer_id") REFERENCES "public"."retailer"("id") ON DELETE no action ON UPDATE no action;