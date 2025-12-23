import { defineConfig } from "drizzle-kit";

const connectionString =
  process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5433/postgres";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
