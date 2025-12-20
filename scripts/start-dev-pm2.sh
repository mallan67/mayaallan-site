#!/usr/bin/env bash
set -euo pipefail

# optional: ensure we are in repo root
cd "$(dirname "$0")/.."

# Force dev DB in case .env.* is not present
: "${DATABASE_URL:=postgres://postgres:testpass@localhost:5433/postgres}"
export DATABASE_URL

echo "Starting Next dev (HOST=0.0.0.0 PORT=3000) with DATABASE_URL=${DATABASE_URL#*:}"
# exec so PM2 attaches to the real process
exec env HOST=0.0.0.0 PORT=3000 NODE_OPTIONS="--max-old-space-size=512" npm run dev
