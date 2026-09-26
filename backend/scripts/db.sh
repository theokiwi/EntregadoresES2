#!/usr/bin/env bash
# Postgres local para desenvolvimento (sem Docker), via nix-shell.
# Uso: scripts/db.sh init|start|stop|status
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGDATA="$ROOT_DIR/.pgdata"
PGPORT="5433"
PGSOCKET="$ROOT_DIR/.pgsocket"
LOGFILE="$PGDATA/server.log"

run_pg() {
  nix-shell -p postgresql_16 --run "$1"
}

cmd_init() {
  if [ -d "$PGDATA" ]; then
    echo "PGDATA já existe em $PGDATA — pulando initdb."
    return
  fi
  mkdir -p "$PGSOCKET"
  run_pg "initdb -D '$PGDATA' -U postgres --auth=trust --no-locale --encoding=UTF8"
}

cmd_start() {
  cmd_init
  mkdir -p "$PGSOCKET"
  if run_pg "pg_ctl -D '$PGDATA' status" >/dev/null 2>&1; then
    echo "Postgres já está rodando."
    return
  fi
  run_pg "pg_ctl -D '$PGDATA' -l '$LOGFILE' -o \"-p $PGPORT -k '$PGSOCKET'\" start"
  run_pg "createdb -h '$PGSOCKET' -p $PGPORT -U postgres entregadores" 2>/dev/null || true
  echo "Postgres rodando na porta $PGPORT (socket em $PGSOCKET)."
  echo "DATABASE_URL=postgresql://postgres@localhost:$PGPORT/entregadores?schema=public"
}

cmd_stop() {
  run_pg "pg_ctl -D '$PGDATA' stop" || true
}

cmd_status() {
  run_pg "pg_ctl -D '$PGDATA' status" || true
}

case "${1:-}" in
  init) cmd_init ;;
  start) cmd_start ;;
  stop) cmd_stop ;;
  status) cmd_status ;;
  *) echo "Uso: $0 {init|start|stop|status}"; exit 1 ;;
esac
