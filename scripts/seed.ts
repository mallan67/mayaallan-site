/**
 * scripts/seed.ts
 * Idempotent seed for admin and default retailers
 */
import bcrypt from "bcryptjs";
import { db } from "../src/db/index";
import { adminUser, retailer } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@mayaallan.com";
  const pw = process.env.SEED_ADMIN_PW || "ChangeThisNow!";
  const hash = await bcrypt.hash(pw, 12);

  // Upsert admin (idempotent)
  const existing = await db.select().from(adminUser).where(eq(adminUser.email, email)).limit(1);
  if ((existing as any[]).length === 0) {
    await db.insert(adminUser).values({
      email,
      passwordHash: hash,
      displayName: "Admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log("Seeded admin:", email);
  } else {
    console.log("Admin exists; skipping admin creation");
  }

  // Seed retailers if none exist
  const rs = await db.select().from(retailer).limit(1);
  if ((rs as any[]).length === 0) {
    await db.insert(retailer).values([
      { name: "Amazon", kind: "marketplace", logoUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { name: "Lulu", kind: "marketplace", logoUrl: null, createdAt: new Date(), updatedAt: new Date() },
      { name: "Google Books", kind: "marketplace", logoUrl: null, createdAt: new Date(), updatedAt: new Date() }
    ]);
    console.log("Seeded default retailers.");
  } else {
    console.log("Retailers exist; skipping retailers seed");
  }
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
