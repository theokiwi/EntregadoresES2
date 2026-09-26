# Backend RotaÁgil

API NestJS + Prisma + PostgreSQL do sistema de monitoramento de rotas.

O guia completo de instalação, banco demonstrativo, credenciais e execução está no
[`README.md` da raiz](../README.md).

## Comandos

```bash
npm install
npm run db:setup    # migrations + seed demonstrativo idempotente
npm run start:dev   # API em http://localhost:3000
npm run build
npm test
npm run test:e2e
```

Copie `.env.example` para `.env` antes do primeiro uso. A configuração padrão espera o
PostgreSQL do `compose.yaml` da raiz na porta `5433`.
