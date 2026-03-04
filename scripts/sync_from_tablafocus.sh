#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SOURCE_DIR="${1:-${TABLAFOCUS_APP_DATA_DIR:-}}"
TARGET_DIR="${2:-$REPO_ROOT/data/private/raw}"

if [[ -z "$SOURCE_DIR" ]]; then
  echo "Usage: $0 <source-data-dir> [target-dir]" >&2
  echo "Or set TABLAFOCUS_APP_DATA_DIR and run without args." >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

for file in glossary.json talas.json quiz_bank.json; do
  if [[ ! -f "$SOURCE_DIR/$file" ]]; then
    echo "Missing source file: $SOURCE_DIR/$file" >&2
    exit 1
  fi
  cp "$SOURCE_DIR/$file" "$TARGET_DIR/$file"
  echo "Synced $file -> $TARGET_DIR"
done

echo "Data sync complete."
