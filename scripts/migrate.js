/**
 * scripts/migrate.js
 * Run SQL files in the migrations/ folder against the DB.
 *
 * Usage:
 *   POSTGRES_URL=postgres://... node scripts/migrate.js
 *
 * The script looks for POSTGRES_URL or DATABASE_URL.
 */

const fs = require("fs");
const path = require("path");
const postgres = require("postgres");

const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("ERROR: Set POSTGRES_URL or DATABASE_URL before running migrations.");
  process.exit(1);
}

(async () => {
  const sql = postgres(url, { prepare: false });
  try {
    const migrationsDir = path.join(__dirname, "..", "migrations");
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
    for (const f of files) {
      const full = path.join(migrationsDir, f);
      console.log("Running:", full);
      const content = fs.readFileSync(full, "utf8");
      // Run as a single statement batch
      await sql.unsafe(content);
    }
    console.log("Migrations completed.");
  } catch (err) {
    console.error("Migration error:", err);
    process.exitCode = 2;
  } finally {
    await sql.end();
  }
})();
