#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_PATH="${1:-$ROOT_DIR/supabase/seed.sql}"
TMP_DUMP="$(mktemp "${TMPDIR:-/tmp}/ngu-seed.XXXXXX.sql")"
trap 'rm -f "$TMP_DUMP"' EXIT

EXCLUDES=(
  "auth.audit_log_entries"
  "auth.flow_state"
  "auth.mfa_amr_claims"
  "auth.mfa_challenges"
  "auth.mfa_factors"
  "auth.one_time_tokens"
  "auth.refresh_tokens"
  "auth.sessions"
  "storage.buckets_analytics"
  "storage.buckets_vectors"
  "storage.iceberg_namespaces"
  "storage.iceberg_tables"
  "storage.s3_multipart_uploads"
  "storage.s3_multipart_uploads_parts"
  "storage.vector_indexes"
)

DUMP_ARGS=(
  db dump
  --local
  --data-only
  --schema public,auth,storage
  --file "$TMP_DUMP"
)

for table in "${EXCLUDES[@]}"; do
  DUMP_ARGS+=(-x "$table")
done

(cd "$ROOT_DIR" && npx supabase "${DUMP_ARGS[@]}")

{
  awk '
    NR == 1 {
      print $0
      print ""
      print "-- Snapshot seed generated from the current local Supabase database."
      print "-- Regenerate with: npm run supabase:seed:snapshot"
      print "TRUNCATE TABLE"
      print "  public.lesson_progress,"
      print "  public.order_items,"
      print "  public.orders,"
      print "  public.enrollments,"
      print "  public.lessons,"
      print "  public.chapters,"
      print "  public.courses,"
      print "  public.coaches,"
      print "  public.profiles,"
      print "  storage.objects,"
      print "  storage.buckets"
      print "RESTART IDENTITY CASCADE;"
      print ""
      next
    }
    /SELECT pg_catalog\.setval\('"'"'"auth"\."refresh_tokens_id_seq"'"'"'/ { next }
    { print }
  ' "$TMP_DUMP"
} > "$OUTPUT_PATH"
