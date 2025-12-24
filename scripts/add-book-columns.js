const { Client } = require("pg");
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Please set DATABASE_URL in env");
  process.exit(1);
}
(async () => {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(`
      ALTER TABLE book
        ADD COLUMN IF NOT EXISTS sales_metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
        ADD COLUMN IF NOT EXISTS seo jsonb DEFAULT '{}'::jsonb NOT NULL,
        ADD COLUMN IF NOT EXISTS seo_title text,
        ADD COLUMN IF NOT EXISTS seo_description text;
    `);
    console.log("Done: columns added (or already existed).");
  } catch (err) {
    console.error("Failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
