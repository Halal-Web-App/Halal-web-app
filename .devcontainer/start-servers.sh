#!/bin/bash
# Runs every time the codespace starts or resumes
set -e

echo "=== Waiting for PostgreSQL ==="
until pg_isready -h localhost -U postgres -q 2>/dev/null; do
  sleep 1
done

echo "=== Starting API server (port 3001) ==="
pkill -f "nodemon server.js" 2>/dev/null || true
pkill -f "node server.js"    2>/dev/null || true
cd /workspace/server
nohup npm start > /tmp/server.log 2>&1 &
echo "API server PID: $!"

echo "=== Starting React client (port 3000) ==="
pkill -f "react-scripts start" 2>/dev/null || true
cd /workspace/client
BROWSER=none nohup npm start > /tmp/client.log 2>&1 &
echo "React PID: $!"

echo ""
echo "=== Servers starting... ==="
echo "Logs: tail -f /tmp/server.log   or   tail -f /tmp/client.log"
echo "Frontend will be available on port 3000 in ~30 seconds."
