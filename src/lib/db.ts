// src/lib/db.ts — server-only safe wrapper
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

/**
 * Support both POSTGRES_URL and DATABASE_URL for flexibility.
 * Throw early and clearly if neither is set.
 */
const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("Missing POSTGRES_URL or DATABASE_URL");

const sql = postgres(connectionString, { ssl: { rejectUnauthorized: false } });

type GlobalWithDrizzle = { __drizzle?: PostgresJsDatabase };
const globalForDrizzle = (global as unknown) as GlobalWithDrizzle;

/**
 * Keep a globally-cached drizzle instance so serverless rebuilds/reloads
 * don't create multiple connections.
 */
export const db = globalForDrizzle.__drizzle ??= drizzle(sql);
