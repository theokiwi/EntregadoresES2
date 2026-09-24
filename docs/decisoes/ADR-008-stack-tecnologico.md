# ADR-008: Stack tecnológico e diagramas de arquitetura

## Status
Aceita

## Contexto
Requisito extra do cliente: documentar as tecnologias de front-end e back-end, com diagramas de componente e de execução, além de garantir uma aplicação usável tanto por Entregadores quanto por Supervisores, em desktop e mobile, sem aplicativo nativo publicado em loja (fora do escopo original) e já multi-tenant ([ADR-004](ADR-004-multi-tenant-estabelecimento.md)).

## Decisão
- **Front-end:** React + TypeScript, SPA responsiva (mesma aplicação para desktop e mobile via web, sem app nativo), gráficos do dashboard (RF08) com Recharts.
- **Back-end:** Node.js + NestJS + TypeScript, API REST, autenticação JWT com claims de `estabelecimentoId`, `unidadeId` e perfil.
- **Banco de dados:** PostgreSQL, multi-tenant por coluna discriminadora `estabelecimento_id` em toda tabela operacional (ver [ADR-004](ADR-004-multi-tenant-estabelecimento.md)), aplicada via middleware/interceptor obrigatório em toda query.
- **ORM:** Prisma.
- **Empacotamento/execução:** contêineres Docker (front, back, banco), permitindo implantação em um único host de nuvem para o MVP.

Detalhamento completo, com diagramas de componente e de execução, em [`arquitetura/arquitetura.md`](../arquitetura/arquitetura.md).

## Consequências
- TypeScript de ponta a ponta (front e back) simplifica tipagem compartilhada e reduz curva de aprendizado da equipe.
- Isolamento multi-tenant depende de disciplina de implementação (toda query passa pelo filtro de `estabelecimento_id`) — risco documentado em `arquitetura.md`.
- Escolha não é imposta pela disciplina; pode ser revista se a equipe tiver restrição de stack.
