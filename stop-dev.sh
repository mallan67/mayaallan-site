#!/usr/bin/env bash
set -euo pipefail

echo "Stopping background dev server and db log capture (if present)..."

if [ -f /tmp/next-dev.pid ]; then
  pid=$(cat /tmp/next-dev.pid)
  if kill -0 "$pid" 2>/dev/null; then
    echo "Killing next dev PID $pid"
    kill "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
  else
    echo "next dev pid $pid not running"
  fi
  rm -f /tmp/next-dev.pid
else
  echo "No /tmp/next-dev.pid found"
fi

if [ -f /tmp/pgtest-logs.pid ]; then
  pid=$(cat /tmp/pgtest-logs.pid)
  if kill -0 "$pid" 2>/dev/null; then
    echo "Killing pgtest logs PID $pid"
    kill "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null || true
  else
    echo "pgtest logs pid $pid not running"
  fi
  rm -f /tmp/pgtest-logs.pid
else
  echo "No /tmp/pgtest-logs.pid found"
fi

echo "Done."
