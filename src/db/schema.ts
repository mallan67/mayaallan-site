/**
 * src/db/schema.ts
 * Drizzle ORM table definitions for Maya Allan admin site
 */

import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * Admin users (single admin)
 */
export const adminUser = pgTable("admin_user", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  displayName: varchar("display_name", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isActive: boolean("is_active").default(true).notNull(),
});

/**
 * Retailers (Amazon, Lulu, Google, etc)
 */
export const retailer = pgTable("retailer", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  kind: varchar("kind", { length: 100 }).notNull(),
  logoUrl: varchar("logo_url", { length: 1000 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Books
 *
 * JS-friendly camelCase keys map to exact DB column names (snake_case).
 */
export const book = pgTable("book", {
  id: serial("id").primaryKey(),

  // required slug column (matches your DB)
  slug: varchar("slug", { length: 320 }).notNull(),

  title: varchar("title", { length: 500 }).notNull(),

  // DB columns are subtitle_1 / subtitle_2
  subtitle1: varchar("subtitle_1", { length: 500 }),
  subtitle2: varchar("subtitle_2", { length: 500 }),

  // JSONB tags
  tags: jsonb("tags").default(sql`'[]'::jsonb`).notNull(),

  isbn: varchar("isbn", { length: 50 }),

  // Short/long descriptions (snake_case DB columns)
  shortDescription: text("short_description"),
  longDescription: text("long_description"),

  coverImageUrl: varchar("cover_image_url", { length: 1000 }),
  backCoverImageUrl: varchar("back_cover_image_url", { length: 1000 }),

  // DB uses 'direct_sale_enabled'
  allowDirectSale: boolean("direct_sale_enabled").default(false).notNull(),

  // Product ids (DB uses 'stripe_product_id' and 'paypal_button_id')
  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  paypalProductId: varchar("paypal_button_id", { length: 255 }),

  isPublished: boolean("is_published").default(false).notNull(),

  // <- keep JS property exactly "comingSoon" mapped to DB column "coming_soon"
  comingSoon: boolean("coming_soon").default(false).notNull(),

  salesMetadata: jsonb("sales_metadata").default(sql`'{}'::jsonb`).notNull(),

  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Book <-> Retailer links
 *
 * Some DBs use an id serial, some use a compound primary key. The schema below
 * declares an id (usual Drizzle-friendly model). If your DB lacks an `id`,
 * you can edit this to remove id and rely on the (book_id, retailer_id) composite key.
 */
export const bookRetailer = pgTable("book_retailer_link", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => book.id),
  retailerId: integer("retailer_id").notNull().references(() => retailer.id),
  url: varchar("url", { length: 2000 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  types: jsonb("types").default(sql`'[]'::jsonb`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
// NOTE: add UNIQUE(book_id, retailer_id) in a migration if you want that constraint

// Backwards-compatibility alias for older snake_case imports:
export const book_retailer_link = bookRetailer;

/**
 * Media items (audio/video)
 */
export const mediaItem = pgTable("media_item", {
  id: serial("id").primaryKey(),
  kind: varchar("kind", { length: 20 }).notNull(),
  title: varchar("title", { length: 500 }),
  description: text("description"),
  coverImageUrl: varchar("cover_image_url", { length: 1000 }),
  isbn: varchar("isbn", { length: 50 }),
  storageUrl: varchar("storage_url", { length: 2000 }),
  externalUrl: varchar("external_url", { length: 2000 }),
  durationSeconds: integer("duration_seconds"),
  mimeType: varchar("mime_type", { length: 200 }),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Events / Meetups
 */
export const event = pgTable("event", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  startAt: timestamp("start_at").notNull(),
  endAt: timestamp("end_at"),
  location: text("location"),
  url: varchar("url", { length: 2000 }),
  isOnline: boolean("is_online").default(false).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Contact submissions (lightweight CRM)
 */
export const contactSubmission = pgTable("contact_submission", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }),
  email: varchar("email", { length: 320 }).notNull(),
  message: text("message"),
  source: varchar("source", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Email subscribers
 */
export const emailSubscriber = pgTable("email_subscriber", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

/**
 * Site settings (key/value JSON)
 */
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 200 }).notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
