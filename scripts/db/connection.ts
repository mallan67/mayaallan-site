import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Use your Codespaces DB URL (from .env or default)
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:testpass@localhost:5432/postgres';

const client = postgres(connectionString);
export const db = drizzle(client);
