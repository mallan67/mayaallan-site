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
  timestamptz,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * Admin users (single admin)
 */
export const adminUser = pgTable("admin_user", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  displayName: varchar("display_name", { length: 200 }).default(null),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
  updatedAt: timestamptz("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

/**
 * Retailers (Amazon, Lulu, Google, etc)
 */
export const retailer = pgTable("retailer", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  kind: varchar("kind", { length: 100 }).notNull(), // 'amazon', 'lulu', 'google', ...
  logoUrl: varchar("logo_url", { length: 1000 }).default(null),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
  updatedAt: timestamptz("updated_at").defaultNow().notNull(),
});

/**
 * Books
 */
export const book = pgTable("book", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  subtitle1: varchar("subtitle1", { length: 500 }).default(null),
  subtitle2: varchar("subtitle2", { length: 500 }).default(null),
  tags: jsonb("tags").default(sql`'[]'::jsonb`).notNull(), // array of keywords/objects
  isbn: varchar("isbn", { length: 50 }).default(null),
  shortDescription: text("short_description").default(null),
  longDescription: text("long_description").default(null),
  coverImageUrl: varchar("cover_image_url", { length: 1000 }).default(null),
  backCoverImageUrl: varchar("back_cover_image_url", { length: 1000 }).default(null),
  allowDirectSale: boolean("allow_direct_sale").default(false).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  isComingSoon: boolean("is_coming_soon").default(false).notNull(),
  salesMetadata: jsonb("sales_metadata").default(sql`'{}'::jsonb`).notNull(),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
  updatedAt: timestamptz("updated_at").defaultNow().notNull(),
});

/**
 * Book <-> Retailer links
 */
export const bookRetailer = pgTable("book_retailer_link", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull(),
  retailerId: integer("retailer_id").notNull(),
  url: varchar("url", { length: 2000 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  types: jsonb("types").default(sql`'[]'::jsonb`).notNull(), // which formats: ["ebook","paperback","hardcover"]
  createdAt: timestamptz("created_at").defaultNow().notNull(),
  updatedAt: timestamptz("updated_at").defaultNow().notNull(),
});

/**
 * Media items (audio/video)
 */
export const mediaItem = pgTable("media_item", {
  id: serial("id").primaryKey(),
  kind: varchar("kind", { length: 20 }).notNull(), // 'audio' | 'video'
  title: varchar("title", { length: 500 }).default(null),
  description: text("description").default(null),
  coverImageUrl: varchar("cover_image_url", { length: 1000 }).default(null),
  isbn: varchar("isbn", { length: 50 }).default(null),
  storageUrl: varchar("storage_url", { length: 2000 }).default(null), // S3 / R2 key or CDN URL
  externalUrl: varchar("external_url", { length: 2000 }).default(null), // YouTube/Vimeo
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
  updatedAt: timestamptz("updated_at").defaultNow().notNull(),
});

/**
 * Events / Meetups
 */
export const event = pgTable("event", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").default(null),
  startAt: timestamptz("start_at").notNull(),
  endAt: timestamptz("end_at").default(null),
  location: text("location").default(null),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
  updatedAt: timestamptz("updated_at").defaultNow().notNull(),
});

/**
 * Contact submissions (lightweight CRM)
 */
export const contactSubmission = pgTable("contact_submission", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).default(null),
  email: varchar("email", { length: 320 }).notNull(),
  message: text("message").default(null),
  source: varchar("source", { length: 200 }).default(null),
  createdAt: timestamptz("created_at").defaultNow().notNull(),
});

/**
 * Email subscribers
 */
export const emailSubscriber = pgTable("email_subscriber", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  subscribedAt: timestamptz("subscribed_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

/**
 * Site settings (key/value JSON)
 */
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 200 }).notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamptz("updated_at").defaultNow().notNull(),
});
