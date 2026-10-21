#!/usr/bin/env bash
# Concatenates all supabase/migrations/*.sql into a single init file
# that the docker-compose Postgres container loads on first boot.
#
# Usage:  bash scripts/export-migrations.sh
# Output: docker/init/99-app-migrations.sql

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/docker/init/99-app-migrations.sql"
SRC="$ROOT/supabase/migrations"

mkdir -p "$(dirname "$OUT")"
{
  echo "-- AUTO-GENERATED. Combined application migrations."
  echo "-- Generated: $(date -u +%FT%TZ)"
  echo "SET client_min_messages = warning;"
  echo ""
  for f in $(ls "$SRC"/*.sql | sort); do
    echo "-- ===== $(basename "$f") ====="
    cat "$f"
    echo ""
  done
} > "$OUT"

count=$(ls "$SRC"/*.sql | wc -l)
echo "✅ Combined $count migrations → $OUT"
echo "   Restart the stack: docker compose down -v && docker compose up -d"
