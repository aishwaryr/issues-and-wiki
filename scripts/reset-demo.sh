#!/usr/bin/env bash
# Resets a database's data to the frozen copy on the Neon `demo-snapshot` branch:
# users, issues, wiki pages, issue ↔ page links and comments. Sessions are cleared too.
#
#   npm run demo:reset -- prod    # the live site's database
#   npm run demo:reset -- local   # DATABASE_URL from .env.local
#
# Connection strings are pasted at hidden prompts and never written to disk.
# Needs pg_dump and psql at least as new as the Neon server (18).
set -euo pipefail

target="${1:-}"
if [[ "$target" != "prod" && "$target" != "local" ]]; then
  echo "Usage: npm run demo:reset -- prod | local" >&2
  exit 1
fi

read -rsp "demo-snapshot connection string (database triagebook_prod): " snapshot_url
echo

if [[ "$target" == "prod" ]]; then
  read -rsp "Production connection string (database triagebook_prod): " target_url
  echo
else
  target_url="$(grep -E '^DATABASE_URL=' .env.local | head -n 1 | cut -d= -f2- | tr -d '"'"'")"
fi

# pg_dump needs a direct connection, not Neon's pooler.
snapshot_url="${snapshot_url/-pooler./.}"
target_url="${target_url/-pooler./.}"

if [[ -z "$snapshot_url" || -z "$target_url" ]]; then
  echo "A connection string is empty." >&2
  exit 1
fi
if [[ "$snapshot_url" == "$target_url" ]]; then
  echo "The snapshot and the target are the same database." >&2
  exit 1
fi

read -rp "This replaces all users, issues and wiki pages in '$target'. Type reset to continue: " answer
if [[ "$answer" != "reset" ]]; then
  echo "Cancelled."
  exit 1
fi

dump="$(mktemp)"
trap 'rm -f "$dump"' EXIT

# Data only: the schema comes from the migrations. Owned sequences come along, so
# the next issue number continues after the snapshot's last ISS-n.
pg_dump "$snapshot_url" --data-only --no-owner --no-privileges \
  -t users -t issues -t wiki_pages -t issue_wiki_links -t issue_comments \
  -f "$dump"

# One transaction: if any row fails, nothing changes.
psql "$target_url" --quiet --single-transaction -v ON_ERROR_STOP=1 \
  -c "TRUNCATE users, issues, wiki_pages, issue_wiki_links, issue_comments, sessions RESTART IDENTITY CASCADE" \
  -f "$dump" > /dev/null

psql "$target_url" --tuples-only --no-align -c \
  "SELECT (SELECT count(*) FROM users) || ' users, ' || (SELECT count(*) FROM issues) || ' issues, ' || (SELECT count(*) FROM wiki_pages) || ' wiki pages, ' || (SELECT count(*) FROM issue_wiki_links) || ' links, ' || (SELECT count(*) FROM issue_comments) || ' comments'"
echo "Done: '$target' now matches demo-snapshot."
