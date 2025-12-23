#!/usr/bin/env node
// scripts/backup_book.js
const fs = require("fs");
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
    console.log("Querying public.book ...");
    const rows = await sql`SELECT * FROM public.book ORDER BY id`;
    if (!rows || rows.length === 0) {
      console.log("No rows in public.book; a JSON backup will be written.");
      const out = `book_backup_${Date.now()}.json`;
      fs.writeFileSync(out, JSON.stringify([]), "utf8");
      console.log("Wrote", out);
      process.exit(0);
    }

    const cols = Object.keys(rows[0]);
    const out = `book_backup_${Date.now()}.csv`;
    const lines = [cols.join(",")];

    for (const r of rows) {
      const vals = cols.map((c) => {
        const v = r[c];
        if (v === null || v === undefined) return "";
        if (typeof v === "object") {
          // JSON fields -> JSON string escaped
          const s = JSON.stringify(v).replace(/"/g, '""');
          return `"${s}"`;
        }
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      });
      lines.push(vals.join(","));
    }

    fs.writeFileSync(out, lines.join("\n"), "utf8");
    console.log("Wrote", out);
  } catch (err) {
    console.error("Backup failed:", err);
    process.exit(1);
  } finally {
    try { await sql.end(); } catch (e) {}
  }
})();
