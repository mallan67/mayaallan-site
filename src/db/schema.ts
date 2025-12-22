/**
 * src/db/schema.ts
 * Drizzle ORM table definitions that match the DB (snake_case columns).
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
  primaryKey,
} from "drizzle-orm/pg-core";

/** admin_user */
export const adminUser = pgTable("admin_user", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  displayName: varchar("display_name", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isActive: boolean("is_active").default(true).notNull(),
});

/** retailer */
export const retailer = pgTable("retailer", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  kind: varchar("kind", { length: 100 }).notNull(),
  logoUrl: varchar("logo_url", { length: 1000 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/** book - map JS-friendly camelCase props to the exact DB snake_case columns */
export const book = pgTable("book", {
  id: serial("id").primaryKey(),

  // DB column "slug"
  slug: varchar("slug", { length: 320 }).notNull(),

  title: varchar("title", { length: 500 }).notNull(),

  // DB columns subtitle_1 / subtitle_2
  subtitle1: varchar("subtitle_1", { length: 500 }),
  subtitle2: varchar("subtitle_2", { length: 500 }),

  // tags JSONB
  tags: jsonb("tags").default(sql`'[]'::jsonb`).notNull(),

  isbn: varchar("isbn", { length: 50 }),

  // descriptions
  shortDescription: text("short_description"),
  longDescription: text("long_description"),

  coverImageUrl: varchar("cover_image_url", { length: 1000 }),
  backCoverImageUrl: varchar("back_cover_image_url", { length: 1000 }),

  // DB column direct_sale_enabled
  allowDirectSale: boolean("direct_sale_enabled").default(false).notNull(),

  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  paypalProductId: varchar("paypal_button_id", { length: 255 }),

  isPublished: boolean("is_published").default(false).notNull(),
  comingSoon: boolean("coming_soon").default(false).notNull(),

  salesMetadata: jsonb("sales_metadata").default(sql`'{}'::jsonb`).notNull(),
  seo: jsonb("seo").default(sql`'{}'::jsonb`).notNull(),

  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * book_retailer_link
 *
 * Important: your DB uses book_id + retailer_id (no serial id).
 * Declare a composite primary key so Drizzle doesn't expect an `id` column.
 */
export const bookRetailer = pgTable(
  "book_retailer_link",
  {
    bookId: integer("book_id").notNull().references(() => book.id),
    retailerId: integer("retailer_id").notNull().references(() => retailer.id),
    url: varchar("url", { length: 2000 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    types: jsonb("types").default(sql`'[]'::jsonb`).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  // table options: composite primary key
  (t) => ({ pk: primaryKey(t.bookId, t.retailerId) })
);

// backwards compatibility: if any code imports snake_case export name
export const book_retailer_link = bookRetailer;

/** media_item */
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

/** event */
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

/** contact_submission */
export const contactSubmission = pgTable("contact_submission", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }),
  email: varchar("email", { length: 320 }).notNull(),
  message: text("message"),
  source: varchar("source", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** email_subscriber */
export const emailSubscriber = pgTable("email_subscriber", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

/** site_settings */
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 200 }).notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
