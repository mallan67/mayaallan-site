cat > src/db/schema.ts <<'EOF'
import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

// --------------------
// Admin (single admin)
// --------------------
export const adminUser = pgTable("admin_user", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --------------------
// Retailers + Books
// --------------------
export const retailer = pgTable("retailer", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // e.g. amazon, lulu
  iconUrl: text("icon_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const book = pgTable(
  "book",
  {
    id: serial("id").primaryKey(),

    // public routing
    slug: text("slug").notNull().unique(), // e.g. "psilocybin-integration-guide"

    // display
    title: text("title").notNull(),
    subtitle1: text("subtitle_1"),
    subtitle2: text("subtitle_2"),

    tagsCsv: text("tags_csv").default("").notNull(), // simple: "tag1,tag2"

    isbn: text("isbn"),
    copyright: text("copyright"),

    blurb: text("blurb"), // short description

    coverUrl: text("cover_url"), // Blob URL
    backCoverUrl: text("back_cover_url"), // optional

    // visibility controls (GLOBAL RULE)
    isPublished: boolean("is_published").default(false).notNull(),
    isVisible: boolean("is_visible").default(false).notNull(), // extra explicit control
    isComingSoon: boolean("is_coming_soon").default(false).notNull(),

    // Direct sale options
    allowDirectSale: boolean("allow_direct_sale").default(false).notNull(),
    stripePaymentLink: text("stripe_payment_link"),
    paypalPaymentLink: text("paypal_payment_link"),

    // SEO overrides (optional per item)
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImageUrl: text("og_image_url"),
    noIndex: boolean("no_index").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: index("book_slug_idx").on(t.slug),
    publishedIdx: index("book_pub_idx").on(t.isPublished),
  })
);

export const bookRetailerLink = pgTable(
  "book_retailer_link",
  {
    bookId: integer("book_id")
      .notNull()
      .references(() => book.id, { onDelete: "cascade" }),
    retailerId: integer("retailer_id")
      .notNull()
      .references(() => retailer.id, { onDelete: "restrict" }),
    url: text("url").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.bookId, t.retailerId] }),
    bookIdx: index("brl_book_idx").on(t.bookId),
  })
);

// --------------------
// Media (audio + video)
// --------------------
export const mediaItem = pgTable(
  "media_item",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(), // "audio" | "video"

    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),

    coverUrl: text("cover_url"),

    // Either uploaded file OR external URL
    fileUrl: text("file_url"),
    externalUrl: text("external_url"),

    isbn: text("isbn"),

    isPublished: boolean("is_published").default(false).notNull(),
    isVisible: boolean("is_visible").default(false).notNull(),

    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImageUrl: text("og_image_url"),
    noIndex: boolean("no_index").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    slugIdx: index("media_slug_idx").on(t.slug),
  })
);

// --------------------
// Events
// --------------------
export const event = pgTable(
  "event",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),

    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at"),

    locationText: text("location_text"), // NYC / etc
    locationUrl: text("location_url"), // zoom / venue link

    // visibility rules
    isPublished: boolean("is_published").default(false).notNull(),
    isVisible: boolean("is_visible").default(false).notNull(),
    keepVisibleAfterEnd: boolean("keep_visible_after_end").default(false).notNull(),

    // calendar integration (future)
    calendarUrl: text("calendar_url"),

    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImageUrl: text("og_image_url"),
    noIndex: boolean("no_index").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    startsIdx: index("event_starts_idx").on(t.startsAt),
  })
);

// --------------------
// CRM (lightweight)
// --------------------
export const contactSubmission = pgTable("contact_submission", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  message: text("message"),
  source: text("source"), // page/referrer/campaign
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailSubscriber = pgTable("email_subscriber", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --------------------
// Site settings (future style controls + global SEO)
// --------------------
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),

  // global SEO defaults
  siteTitle: text("site_title").default("Maya Allan").notNull(),
  siteDescription: text("site_description").default("").notNull(),
  defaultOgImageUrl: text("default_og_image_url"),

  // style controls
  fontBody: text("font_body").default("serif").notNull(),
  fontHeading: text("font_heading").default("serif").notNull(),
  accentColor: text("accent_color").default("#0f172a").notNull(),
  maxWidth: text("max_width").default("max-w-6xl").notNull(),
  buttonStyle: text("button_style").default("rounded").notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
EOF
