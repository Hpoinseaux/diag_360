#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

COMPOSE_COMMAND="${COMPOSE_COMMAND:-docker compose}"
DEFAULT_XLSX="${DATA_FILE:-./Diag360_EvolV2.xlsx}"
DEFAULT_YEAR="${DATA_YEAR:-0}"

usage() {
  cat <<'EOF'
Usage: scripts/run_pipeline.sh <command> [options]

Commands:
  up                     Start all services (detached).
  down                   Stop and remove services.
  logs                   Tail backend + frontend + nocodb logs.
  ingest [path]          Run XLSX ingestion (defaults to ./Diag360_EvolV2.xlsx).
  need-scores [year]     Compute need scores (defaults to DATA_YEAR env or 0).
  fetch <url>            Fetch external JSON data via backend CLI.
  shell                  Open an interactive shell inside the backend container.

Environment overrides:
  COMPOSE_COMMAND        Defaults to "docker compose".
  DATA_FILE              Default XLSX path for ingestion.
  DATA_YEAR              Default data_year for need score computation.
EOF
}

require_arg() {
  if [[ -z "${2:-}" ]]; then
    echo "Error: missing argument for $1" >&2
    usage
    exit 1
  fi
}

case "${1:-}" in
  up)
    shift
    $COMPOSE_COMMAND up -d "$@"
    ;;
  down)
    $COMPOSE_COMMAND down
    ;;
  logs)
    $COMPOSE_COMMAND logs -f backend frontend nocodb
    ;;
  ingest)
    shift
    XLSX_PATH="${1:-$DEFAULT_XLSX}"
    $COMPOSE_COMMAND run --rm --profile ingest backend_ingest --file "$XLSX_PATH"
    ;;
  need-scores)
    shift
    YEAR="${1:-$DEFAULT_YEAR}"
    $COMPOSE_COMMAND run --rm backend python -m app.cli.compute_need_scores --data-year "$YEAR"
    ;;
  fetch)
    shift
    require_arg "--url" "${1:-}"
    URL="$1"
    $COMPOSE_COMMAND run --rm backend python -m app.cli.fetch_external_data --url "$URL"
    ;;
  shell)
    $COMPOSE_COMMAND exec backend bash
    ;;
  ""|-h|--help|help)
    usage
    ;;
  *)
    echo "Unknown command: $1" >&2
    usage
    exit 1
    ;;
esac
