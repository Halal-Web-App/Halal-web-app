#!/bin/bash
# Runs ONCE on first codespace creation
set -e

echo "=== Installing dependencies ==="
cd /workspace

npm install
cd server && npm install && cd ..
cd client && npm install --legacy-peer-deps && cd ..

echo "=== Writing server .env ==="
cat > /workspace/server/.env << 'EOF'
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=yelp
PGPORT=5432
PORT=3001
EOF

echo "=== Waiting for PostgreSQL ==="
until pg_isready -h localhost -U postgres -q 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL ready."

echo "=== Running DB migration ==="
PGPASSWORD=password psql -h localhost -U postgres -d yelp \
  -f /workspace/server/DB/db.sql \
  && echo "Migration OK." \
  || echo "Migration had warnings (may already be applied)."

echo "=== Seeding data (if empty) ==="
COUNT=$(PGPASSWORD=password psql -h localhost -U postgres -d yelp \
  -tAc "SELECT COUNT(*) FROM restaurants;" 2>/dev/null || echo "0")
if [ "$COUNT" = "0" ] && [ -f /workspace/restaurants.json ]; then
  cd /workspace/scrape_data && node to_db.js ../restaurants.json && cd ..
  echo "Seed complete."
else
  echo "DB has $COUNT restaurants — skipping seed."
fi

echo "=== One-time setup complete ==="
