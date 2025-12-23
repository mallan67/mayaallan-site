cat > src/lib/db.ts <<'TS'
/**
 * src/lib/db.ts — server-only
 *
 * Use a simple typed global wrapper instead of `declare global` so the
 * Next/SWC parser doesn't choke on ambient declarations.
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: { rejectUnauthorized: false }, // adjust for your env/provider
  // you can add other postgres() options here if needed
});

// Ensure we reuse the drizzle instance across hot reloads.
// Avoid "declare global" — use a typed cast for maximum compatibility.
type GlobalWithDrizzle = { __drizzle?: PostgresJsDatabase };
const globalForDrizzle = (global as unknown) as GlobalWithDrizzle;

export const db = globalForDrizzle.__drizzle ??= drizzle(sql);
TS
