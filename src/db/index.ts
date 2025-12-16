mkdir -p src/db

cat > src/db/index.ts <<'EOF'
import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Missing DATABASE_URL");

export const sql = postgres(connectionString, {
  max: 1,
  ssl: "require",
});

export const db = drizzle(sql);
EOF
