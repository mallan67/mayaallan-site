/**
 * src/lib/db.ts — server-only safe wrapper
 *
 * Use a typed global wrapper instead of `declare global` so the
 * Next/SWC parser doesn't choke on ambient declarations.
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: { rejectUnauthorized: false },
});

type GlobalWithDrizzle = {
  __drizzle?: PostgresJsDatabase;
};

const globalForDrizzle = (global as unknown) as GlobalWithDrizzle;

export const db = globalForDrizzle.__drizzle ??= drizzle(sql);
