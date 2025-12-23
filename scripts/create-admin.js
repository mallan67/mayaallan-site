/**
 * scripts/create-admin.js
 * Usage:
 *   POSTGRES_URL=... ADMIN_EMAIL=you@domain.com ADMIN_PASSWORD=StrongPass node scripts/create-admin.js
 */
const postgres = require("postgres");
const bcrypt = require("bcryptjs");

const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("Set POSTGRES_URL or DATABASE_URL first.");
  process.exit(1);
}

const email = process.env.ADMIN_EMAIL || "admin@example.com";
const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";

(async () => {
  const sql = postgres(url, { prepare: false });
  try {
    const hash = await bcrypt.hash(password, 12);
    console.log("Upserting admin:", email);
    await sql`
      INSERT INTO admin_user (email, password_hash, display_name, is_active, created_at)
      VALUES (${email}, ${hash}, ${"Admin"}, true, now())
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, display_name = EXCLUDED.display_name, is_active = EXCLUDED.is_active, updated_at = now();
    `;
    console.log("Admin upserted. Credentials:", { email, password });
  } catch (err) {
    console.error("Error creating admin:", err);
  } finally {
    await sql.end();
  }
})();
