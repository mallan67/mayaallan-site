#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

# 1) Ensure Postgres container (idempotent)
"$ROOT/ensure-postgres.sh"

# 2) Ensure repo root as working dir and set DB env
export DATABASE_URL="postgres://postgres:testpass@localhost:5433/postgres"
echo "Using DATABASE_URL=${DATABASE_URL}"

# 3) If tmux exists, create a session; otherwise fallback to nohup
SESSION="maya"

if command -v tmux >/dev/null 2>&1; then
  echo "tmux found. Creating session '${SESSION}' (if not already present)..."
  if tmux has-session -t "$SESSION" 2>/dev/null; then
    echo "tmux session '$SESSION' already exists, attaching..."
    tmux attach -t "$SESSION"
    exit 0
  fi

  # new session: left pane runs dev server (auto-restarts), right pane shows pg logs
  tmux new-session -d -s "$SESSION" -c "$ROOT" \
    "bash -lc 'echo DEV: starting dev server loop; while true; do HOST=0.0.0.0 PORT=3000 npm run dev || sleep 1; done'"

  tmux split-window -h -t "$SESSION" -c "$ROOT" "bash -lc 'echo DB logs:; docker logs -f pgtest'"
  tmux select-pane -L -t "$SESSION"
  echo "tmux session '$SESSION' started. Attach with: tmux attach -t $SESSION"
  tmux attach -t "$SESSION"
  exit 0
fi

# Fallback: nohup + restart loop (good for disconnected terminals)
echo "tmux not found. Starting dev server in background with nohup (logs -> /tmp/next-dev.log)."
# Run the dev server in background and capture the actual PID ($!) in a PID file
nohup bash -lc "cd '$ROOT' && while true; do HOST=0.0.0.0 PORT=3000 npm run dev || sleep 1; done" > /tmp/next-dev.log 2>&1 & 
echo $! > /tmp/next-dev.pid
echo "Started next dev in background (PID $(cat /tmp/next-dev.pid)). Tail logs with: tail -f /tmp/next-dev.log"

# optional: background docker logs so you can inspect db logs later
nohup bash -lc "docker logs -f pgtest" > /tmp/pgtest.log 2>&1 &
echo $! > /tmp/pgtest-logs.pid
echo "Started db logs capture to /tmp/pgtest.log (PID $(cat /tmp/pgtest-logs.pid))."
