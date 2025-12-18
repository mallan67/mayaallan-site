-- 001_init.sql
-- Initial schema for Maya Allan site (Drizzle-compatible)

CREATE TABLE IF NOT EXISTS admin_user (
  id serial PRIMARY KEY,
  email varchar(320) NOT NULL UNIQUE,
  password_hash varchar(256) NOT NULL,
  display_name varchar(200),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS retailer (
  id serial PRIMARY KEY,
  name varchar(200) NOT NULL,
  kind varchar(100) NOT NULL,
  logo_url varchar(1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS book (
  id serial PRIMARY KEY,
  title varchar(500) NOT NULL,
  subtitle1 varchar(500),
  subtitle2 varchar(500),
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  isbn varchar(50),
  short_description text,
  long_description text,
  cover_image_url varchar(1000),
  back_cover_image_url varchar(1000),
  allow_direct_sale boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  is_coming_soon boolean NOT NULL DEFAULT false,
  sales_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS book_retailer_link (
  id serial PRIMARY KEY,
  book_id integer NOT NULL,
  retailer_id integer NOT NULL,
  url varchar(2000) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  types jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_book FOREIGN KEY(book_id) REFERENCES book(id) ON DELETE CASCADE,
  CONSTRAINT fk_retailer FOREIGN KEY(retailer_id) REFERENCES retailer(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS media_item (
  id serial PRIMARY KEY,
  kind varchar(20) NOT NULL,
  title varchar(500),
  description text,
  cover_image_url varchar(1000),
  isbn varchar(50),
  storage_url varchar(2000),
  external_url varchar(2000),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "event" (
  id serial PRIMARY KEY,
  title varchar(500) NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  location text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_submission (
  id serial PRIMARY KEY,
  name varchar(200),
  email varchar(320) NOT NULL,
  message text,
  source varchar(200),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS email_subscriber (
  id serial PRIMARY KEY,
  email varchar(320) NOT NULL UNIQUE,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS site_settings (
  id serial PRIMARY KEY,
  key varchar(200) NOT NULL UNIQUE,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Optionally: indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_book_is_published ON book(is_published);
CREATE INDEX IF NOT EXISTS idx_event_start_at ON "event"(start_at);
