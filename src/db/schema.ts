import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

// Admin Users
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
});

// Books
export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle1: text('subtitle1'),
  subtitle2: text('subtitle2'),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  isbn: text('isbn'),
  copyrightInfo: text('copyright_info'),
  tags: text('tags').array(),
  coverImageUrl: text('cover_image_url'),
  backCoverImageUrl: text('back_cover_image_url'),
  isPublished: boolean('is_published').default(false).notNull(),
  isComingSoon: boolean('is_coming_soon').default(false).notNull(),
  showBlankIfNoSales: boolean('show_blank_if_no_sales').default(false).notNull(),
  allowDirectSale: boolean('allow_direct_sale').default(false).notNull(),
  isEbook: boolean('is_ebook').default(false).notNull(),
  ebookFileUrl: text('ebook_file_url'),
  ebookFormat: text('ebook_format'),
  directSalePrice: integer('direct_sale_price'),
  enableStripe: boolean('enable_stripe').default(false),
  enablePaypal: boolean('enable_paypal').default(false),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  ogImage: text('og_image'),
  customFields: jsonb('custom_fields'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Retailers
export const retailers = pgTable('retailers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0),
  customFields: jsonb('custom_fields'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Book-Retailer Links
export const bookRetailerLinks = pgTable('book_retailer_links', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  retailerId: integer('retailer_id').notNull().references(() => retailers.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0),
  customFields: jsonb('custom_fields'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Media Items
export const mediaItems = pgTable('media_items', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  mediaUrl: text('media_url'),
  externalUrl: text('external_url'),
  isbn: text('isbn'),
  isPublished: boolean('is_published').default(false).notNull(),
  sortOrder: integer('sort_order').default(0),
  customFields: jsonb('custom_fields'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Events
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: timestamp('event_date').notNull(),
  endDate: timestamp('end_date'),
  location: text('location'),
  eventUrl: text('event_url'),
  eventType: text('event_type'),
  isPublished: boolean('is_published').default(false).notNull(),
  showPastEvents: boolean('show_past_events').default(false).notNull(),
  sortOrder: integer('sort_order').default(0),
  customFields: jsonb('custom_fields'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Contact Submissions
export const contactSubmissions = pgTable('contact_submissions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject'),
  message: text('message').notNull(),
  source: text('source'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  isRead: boolean('is_read').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  notes: text('notes'),
  customFields: jsonb('custom_fields'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Email Subscribers
export const emailSubscribers = pgTable('email_subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  source: text('source'),
  isActive: boolean('is_active').default(true).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  customFields: jsonb('custom_fields'),
  subscribedAt: timestamp('subscribed_at').defaultNow().notNull(),
});

// Site Settings
export const siteSettings = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  category: text('category'),
  description: text('description'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Custom Field Definitions
export const customFieldDefinitions = pgTable('custom_field_definitions', {
  id: serial('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  fieldName: text('field_name').notNull(),
  fieldLabel: text('field_label').notNull(),
  fieldType: text('field_type').notNull(),
  isRequired: boolean('is_required').default(false).notNull(),
  placeholder: text('placeholder'),
  helpText: text('help_text'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Activity Log
export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  adminUserId: integer('admin_user_id').references(() => adminUsers.id),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: integer('entity_id'),
  changes: jsonb('changes'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
