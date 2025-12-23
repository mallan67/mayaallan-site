/**
 * src/lib/db.ts — server-only safe wrapper
 *
 * Use a typed global wrapper instead of `declare global` so the
 * Next/SWC parser doesn't choke on ambient declarations.
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Ensure POSTGRES_URL is set in your .env.local for dev. Adjust ssl if required.
const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: { rejectUnauthorized: false },
  // Add additional options here if needed
});

type GlobalWithDrizzle = {
  __drizzle?: PostgresJsDatabase;
};

// Use a typed casting approach rather than `declare global` so the parser is happy.
const globalForDrizzle = (global as unknown) as GlobalWithDrizzle;

export const db = globalForDrizzle.__drizzle ??= drizzle(sql);
