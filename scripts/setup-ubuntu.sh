#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

info() { printf '\n\033[1;31m[RotaÁgil]\033[0m %s\n' "$1"; }
fail() { printf '\nErro: %s\n' "$1" >&2; exit 1; }

command -v apt-get >/dev/null || fail "Este instalador requer Ubuntu/Debian com apt-get."

info "Instalando dependências do sistema"
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg docker.io

if ! command -v node >/dev/null || ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 20 ? 0 : 1)' 2>/dev/null; then
  info "Instalando Node.js 22 LTS"
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

info "Iniciando PostgreSQL"
sudo systemctl enable --now docker
cd "$ROOT_DIR"
if sudo docker compose version >/dev/null 2>&1; then
  COMPOSE=(sudo docker compose)
else
  sudo apt-get install -y docker-compose
  COMPOSE=(sudo docker-compose)
fi
"${COMPOSE[@]}" up -d postgres
until "${COMPOSE[@]}" exec -T postgres pg_isready -U postgres -d entregadores >/dev/null 2>&1; do sleep 2; done

info "Instalando dependências da aplicação"
npm --prefix backend install
npm --prefix frontend install
if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env; fi

info "Aplicando migrations e criando a base demonstrativa"
(cd backend && npm run db:setup)

info "Setup concluído"
printf '%s\n' \
  "Execute em dois terminais:" \
  "  cd $ROOT_DIR/backend && npm run start:dev" \
  "  cd $ROOT_DIR/frontend && npm run dev" \
  "Acesse http://localhost:5173 e entre com admin@demo.com / Demo@123"
