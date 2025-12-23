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
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/**
 * Admin users (single admin)
 */
export const adminUser = pgTable("admin_user", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: varchar("display_name", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

/**
 * Retailers (Amazon, Lulu, Google, etc)
 */
export const retailer = pgTable(
  "retailer",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    kind: text("kind").default("marketplace").notNull(),
    iconUrl: text("icon_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("retailer_slug_unique").on(table.slug),
    slugIdx: index("retailer_slug_idx").on(table.slug),
  })
);

/**
 * Books
 *
 * JS-friendly camelCase keys map to exact DB column names (snake_case).
 */
export const book = pgTable(
  "book",
  {
    id: serial("id").primaryKey(),

    // required slug column (matches your DB)
    slug: text("slug").notNull(),

    title: text("title").notNull(),

    // DB columns are subtitle_1 / subtitle_2
    subtitle1: text("subtitle_1"),
    subtitle2: text("subtitle_2"),

    isbn: text("isbn"),

    // Short/long descriptions (snake_case DB columns)
    shortDescription: text("short_description"),
    longDescription: text("long_description"),

    coverImageUrl: text("cover_image_url"),
    backCoverImageUrl: text("back_cover_image_url"),

    // DB uses 'direct_sale_enabled'
    directSaleEnabled: boolean("direct_sale_enabled").default(false).notNull(),

    // Product ids (DB uses 'stripe_product_id' and 'paypal_button_id')
    stripeProductId: text("stripe_product_id"),
    paypalButtonId: text("paypal_button_id"),

    isPublished: boolean("is_published").default(false).notNull(),

    // <- keep JS property exactly "comingSoon" mapped to DB column "coming_soon"
    comingSoon: boolean("coming_soon").default(false).notNull(),

    tags: jsonb("tags").default(sql`'[]'::jsonb`).notNull(),
    salesMetadata: jsonb("sales_metadata").default(sql`'{}'::jsonb`).notNull(),
    seo: jsonb("seo").default(sql`'{}'::jsonb`).notNull(),

    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    slugUnique: uniqueIndex("book_slug_unique").on(table.slug),
    slugIdx: index("book_slug_idx").on(table.slug),
    publishedIdx: index("idx_book_is_published").on(table.isPublished),
  })
);

/**
 * Book <-> Retailer links
 *
 * Some DBs use an id serial, some use a compound primary key. The schema below
 * declares an id (usual Drizzle-friendly model). If your DB lacks an `id`,
 * you can edit this to remove id and rely on the (book_id, retailer_id) composite key.
 */
export const bookRetailerLink = pgTable(
  "book_retailer_link",
  {
    id: serial("id").primaryKey(),
    bookId: integer("book_id")
      .notNull()
      .references(() => book.id, { onDelete: "cascade" }),
    retailerId: integer("retailer_id")
      .notNull()
      .references(() => retailer.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    types: jsonb("types").default(sql`'[]'::jsonb`).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    bookRetailerUnique: uniqueIndex("uq_book_retailer").on(table.bookId, table.retailerId),
  })
);
// Backwards-compatibility alias for older snake_case imports:
export const book_retailer_link = bookRetailerLink;

/**
 * Media items (audio/video)
 */
export const mediaItem = pgTable("media_item", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  fileUrl: text("file_url"),
  externalUrl: text("external_url"),
  isbn: text("isbn"),
  isPublished: boolean("is_published").default(false).notNull(),
  isVisible: boolean("is_visible").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Events / Meetups
 */
export const event = pgTable("event", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startAt: timestamp("start_at", { withTimezone: true }),
  endAt: timestamp("end_at", { withTimezone: true }),
  location: text("location"),
  url: text("url"),
  isPublished: boolean("is_published").default(false).notNull(),
  isVisible: boolean("is_visible").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Contact submissions (lightweight CRM)
 */
export const contactSubmission = pgTable("contact_submission", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message"),
  source: text("source"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Email subscribers
 */
export const emailSubscriber = pgTable("email_subscriber", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Site settings (key/value JSON)
 */
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  ogImageUrl: text("og_image_url"),
  accentColor: text("accent_color"),
  fontFamily: text("font_family"),
  layoutWidth: text("layout_width"),
  buttonStyle: text("button_style"),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
