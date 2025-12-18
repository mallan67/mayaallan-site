// scripts/seed-admin.ts
/**
 * Run with: npx ts-node-esm scripts/seed-admin.ts
 * Make sure DATABASE_URL or POSTGRES_URL is set in environment.
 */

import bcrypt from "bcryptjs";
import { db } from "../src/db";
import { adminUser } from "../src/db/schema";

async function run() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@mayaallan.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMeNow!";
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    console.error("ERROR: Set DATABASE_URL or POSTGRES_URL in env before running.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db.insert(adminUser).values({
      email,
      passwordHash,
      displayName: "Site Admin",
      isActive: true,
    });
    console.log(`Seeded admin ${email}`);
  } catch (err: any) {
    console.error("Seed failed:", err.message || err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();
