#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/pull-vercel-env.sh [ENV_NAME] [PROJECT_OR_OWNER [PROJECT_NAME]]
# Examples:
#   ./scripts/pull-vercel-env.sh                  # pull all vars (uses linked project)
#   ./scripts/pull-vercel-env.sh DATABASE_URL     # pull only DATABASE_URL
#   ./scripts/pull-vercel-env.sh DATABASE_URL mallan/mayaallan-site
#   ./scripts/pull-vercel-env.sh DATABASE_URL mallan mayaallan-site
#
ENV_NAME="${1:-}"
ARG2="${2:-}"    # could be "owner/project" or owner
ARG3="${3:-}"    # optional project if using two-arg form
OUTFILE=".env.local"
ENVIRONMENT="production"

if ! command -v vercel >/dev/null 2>&1; then
  echo "Error: Vercel CLI not found. Install: npm i -g vercel  then run: vercel login"
  exit 1
fi

# parse project/owner
SCOPE=""
PROJECT=""
if [ -n "$ARG2" ] && [ -n "$ARG3" ]; then
  # two-arg form: owner project
  SCOPE="$ARG2"
  PROJECT="$ARG3"
elif [ -n "$ARG2" ]; then
  # single arg: could be "owner/project" or "owner"
  if echo "$ARG2" | grep -q '/'; then
    SCOPE="${ARG2%%/*}"
    PROJECT="${ARG2#*/}"
  else
    # single token, treat as owner (scope)
    SCOPE="$ARG2"
  fi
fi

echo "Pulling ${ENVIRONMENT} environment variables from Vercel..."
echo "Output file: ${OUTFILE}"
if [ -n "$SCOPE" ]; then
  echo "Owner/scope: $SCOPE"
fi
if [ -n "$PROJECT" ]; then
  echo "Project: $PROJECT"
fi
echo ""

# Backup existing file (if present)
BACKUP=""
if [ -f "${OUTFILE}" ]; then
  TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
  BACKUP="${OUTFILE}.bak.${TIMESTAMP}"
  echo "Backing up existing ${OUTFILE} -> ${BACKUP}"
  cp -p "${OUTFILE}" "${BACKUP}"
  chmod 600 "${BACKUP}" || true
  echo ""
fi

# Build common extra args
extra_args=()
if [ -n "${VERCEL_TOKEN:-}" ]; then
  extra_args+=(--token "$VERCEL_TOKEN")
fi
if [ -n "$SCOPE" ]; then
  extra_args+=(--scope "$SCOPE")
fi
if [ -n "$PROJECT" ]; then
  extra_args+=(--project "$PROJECT")
fi

# Pull all vars
pull_all() {
  vercel env pull "$OUTFILE" --environment "$ENVIRONMENT" "${extra_args[@]}"
}

# Pull a single var (use vercel env get)
pull_var() {
  local name="$1"
  # 'vercel env get': prints the value (or exits non-zero)
  # We capture the value and write key="value" safely into OUTFILE
  local value
  # Use a temp file for robust capture
  value=$(vercel env get "$name" "$ENVIRONMENT" "${extra_args[@]}" 2>/dev/null) || return 1

  # Escape backslashes and double-quotes so it's valid inside double quotes
  local esc
  esc=$(printf '%s' "$value" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')

  # Write a single-line KEY="value" to OUTFILE
  printf '%s="%s"\n' "$name" "$esc" > "$OUTFILE"
}

# Run the requested operation with backup/restore on failure
if [ -n "$ENV_NAME" ]; then
  echo "Fetching only variable: $ENV_NAME"
  if pull_var "$ENV_NAME"; then
    chmod 600 "$OUTFILE" 2>/dev/null || true
    echo ""
    echo "Done! Wrote $ENV_NAME to $OUTFILE (permissions: 600)."
    exit 0
  else
    echo ""
    echo "ERROR: failed to fetch $ENV_NAME via vercel env get"
    if [ -n "$BACKUP" ] && [ -f "$BACKUP" ]; then
      cp -p "$BACKUP" "$OUTFILE" && chmod 600 "$OUTFILE" || true
      echo "Restored ${OUTFILE} from ${BACKUP}."
    fi
    exit 2
  fi
else
  echo "Fetching ALL variables with vercel env pull..."
  if pull_all; then
    chmod 600 "$OUTFILE" 2>/dev/null || true
    echo ""
    echo "Done! ${OUTFILE} has been updated (permissions: 600)."
    exit 0
  else
    echo ""
    echo "ERROR: vercel env pull failed - restoring previous ${OUTFILE} from backup (if present)."
    if [ -n "$BACKUP" ] && [ -f "$BACKUP" ]; then
      cp -p "${BACKUP}" "${OUTFILE}" && chmod 600 "${OUTFILE}" || true
      echo "Restored ${OUTFILE} from ${BACKUP}."
    fi
    exit 2
  fi
fi
