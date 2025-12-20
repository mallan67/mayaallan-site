#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Make sure docker is available
if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker not found. Please install Docker or run this on a host with Docker."
  exit 1
fi

# Create volume if not exists (safe)
docker volume inspect pgtest-data >/dev/null 2>&1 || docker volume create pgtest-data >/dev/null

# If container exists but is stopped, start it; if not exists create it
if docker ps --filter name=pgtest --format '{{.Names}}' | grep -q '^pgtest$'; then
  echo "pgtest already running."
elif docker ps -a --filter name=pgtest --format '{{.Names}}' | grep -q '^pgtest$'; then
  echo "Starting existing pgtest container..."
  docker start pgtest
else
  echo "Creating pgtest container (postgres:17). Data kept in docker volume 'pgtest-data' and ./backups mounted."
  mkdir -p "$ROOT/backups"
  docker run -d --name pgtest \
    -e POSTGRES_PASSWORD=testpass \
    -v pgtest-data:/var/lib/postgresql/data \
    -v "$ROOT/backups":/backups \
    -p 5433:5432 \
    postgres:17
fi

echo "Waiting for postgres to be ready (pg_isready)..."
# Wait until ready
until docker exec pgtest pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done

echo "pgtest is ready and listening on host port 5433 (container:5432)."
