/**
 * Safe lazy DB initializer.
 * This file intentionally does NOT throw at import time if POSTGRES_URL or DATABASE_URL
 * are missing, because Next.js build may import modules during the build.
 *
 * Export `getDb()` that returns the Drizzle DB instance or null if not configured.
 * Callers should handle null (return 500 / friendly message) in runtime handlers.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import postgres from "postgres";

function getConnectionString(): string | null {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? null;
}

let _db: ReturnType<typeof drizzle> | null = null;
let _sql: any = null;

export function initDbIfNeeded() {
  if (_db) return _db;
  const conn = getConnectionString();
  if (!conn) {
    // Do NOT throw on import/build — warn and return null.
    // Any runtime handler calling DB should check and return an error response.
    // This avoids build-time failures when DB env is not present.
    // eslint-disable-next-line no-console
    console.warn(
      "Database not configured: POSTGRES_URL or DATABASE_URL not set. DB calls will throw at runtime if invoked."
    );
    return null;
  }

  // require lazily to avoid top-level build-time dependency resolution
  _sql = postgres(conn, {
    ssl: { rejectUnauthorized: false },
  });
  _db = drizzle(_sql);
  return _db;
}

export function getDb() {
  return initDbIfNeeded();
}
