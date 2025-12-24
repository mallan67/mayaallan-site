// scripts/create-admin.js
const postgres = require('postgres');
const bcrypt = require('bcryptjs');

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
  console.error('Set POSTGRES_URL env var first, e.g.: export POSTGRES_URL="postgres://postgres:postgres@127.0.0.1:5432/postgres"');
  process.exit(1);
}

const email = process.argv[2] || 'admin@example.com';
const password = process.argv[3] || 'MyStrongPass1!';

(async () => {
  const sql = postgres(POSTGRES_URL, { prepare: false });
  const hash = bcrypt.hashSync(password, 10);

  try {
    // Adjust table/columns if your schema differs. This follows the repo's admin_user table.
    await sql`
      INSERT INTO admin_user (email, password_hash, display_name, created_at, updated_at, is_active)
      VALUES (${email}, ${hash}, 'Admin', now(), now(), true)
      ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash, updated_at = now();
    `;
    console.log(`Admin user ensured: ${email} (password: ${password})`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin user:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
})();
