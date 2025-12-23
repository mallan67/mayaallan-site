// src/lib/db.ts — server-only
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

declare global {
  // Prevent creating multiple clients during dev hot-reloads
  // eslint-disable-next-line no-var
  var __drizzle?: PostgresJsDatabase;
}

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: { rejectUnauthorized: false }, // adjust for your env/provider
  // You can add other postgres() options here if needed
});

export const db = global.__drizzle ??= drizzle(sql);
