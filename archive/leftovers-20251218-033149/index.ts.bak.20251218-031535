import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

let client: any = undefined;
export let db: any = undefined;

if (connectionString) {
  // serverless-safe config
  client = postgres(connectionString, { prepare: false });
  db = drizzle(client);
} else {
  // Export a proxy so imports never throw during build.
  // The proxy will throw when a DB method is actually used, with a clear message.
  db = new Proxy(
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

export const clientExport = client;
