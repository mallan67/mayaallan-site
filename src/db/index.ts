// Guarded DB client for server builds.
// Exports `db` (named export) and `clientExport`.
// If DATABASE_URL/POSTGRES_URL is missing, `db` is a dummy proxy that throws at runtime when used.
import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

let client: any = undefined;
let _db: any = undefined;

if (connectionString) {
  client = postgres(connectionString, { prepare: false });
  _db = drizzle(client);
} else {
  _db = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "__is_dummy_db") return true;
        throw new Error(
          `Database not configured. POSTGRES_URL or DATABASE_URL must be set before calling database methods (attempted to access '${String(
            prop
          )}').`
        );
      },
      apply() {
        throw new Error(
          "Database not configured. POSTGRES_URL or DATABASE_URL must be set before calling database methods."
        );
      },
    }
  ) as any;
}

// named exports required by app code
export const db = _db;
export const clientExport = client;
