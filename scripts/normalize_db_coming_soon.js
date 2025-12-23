#!/usr/bin/env node
// scripts/normalize_db_coming_soon.js
const postgres = require("postgres");
try { require("dotenv").config(); } catch (e) {}

(async () => {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url) {
    console.error("Error: set POSTGRES_URL or DATABASE_URL in your environment.");
    process.exit(2);
  }

  const sql = postgres(url, { prepare: false });
  try {
    // 1) Does coming_soon exist?
    const comingExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'book'
          AND column_name = 'coming_soon'
      )`;
    if (!comingExists[0].exists) {
      console.log("Adding column coming_soon (default false NOT NULL) ...");
      await sql`ALTER TABLE public.book ADD COLUMN coming_soon boolean DEFAULT false NOT NULL`;
    } else {
      console.log("coming_soon already exists.");
    }

    // 2) Does legacy is_coming_soon exist?
    const legacyExists = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'book'
          AND column_name = 'is_coming_soon'
      )`;
    if (legacyExists[0].exists) {
      console.log("Legacy column is_coming_soon exists — backfilling coming_soon ...");
      // Backfill only where values differ
      await sql`UPDATE public.book
                SET coming_soon = COALESCE(is_coming_soon, false)
                WHERE coming_soon IS DISTINCT FROM COALESCE(is_coming_soon, false)`;
      console.log("Dropping legacy column is_coming_soon ...");
      await sql`ALTER TABLE public.book DROP COLUMN is_coming_soon`;
    } else {
      console.log("No legacy column is_coming_soon found.");
    }

    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    try { await sql.end(); } catch (e) {}
  }
})();
