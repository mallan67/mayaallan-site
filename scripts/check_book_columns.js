#!/usr/bin/env node
// scripts/check_book_columns.js
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
    const cols = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'book'
      ORDER BY ordinal_position
    `;
    console.log("Columns in public.book:");
    for (const r of cols) console.log(" -", r.column_name);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    try { await sql.end(); } catch (e) {}
  }
})();
