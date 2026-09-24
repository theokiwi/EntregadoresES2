# Arquitetura

Visão de tecnologias e diagramas estruturais do MVP. Decisão registrada em [ADR-008](../decisoes/ADR-008-stack-tecnologico.md); pressupõe o modelo multi-tenant de [ADR-004](../decisoes/ADR-004-multi-tenant-estabelecimento.md).

## Requisitos de arquitetura que guiaram as escolhas

- Multi-tenant: um Estabelecimento nunca acessa dados de outro (RNF04 estendido, [ADR-004](../decisoes/ADR-004-multi-tenant-estabelecimento.md)).
- Uma aplicação usável por Entregadores e por Supervisores, em desktop e mobile, sem app nativo publicado em loja (RNF02, fora de escopo original).
- Tempo de resposta do dashboard < 3s para até 12 meses de dados (RNF03).
- Persistência com histórico completo e auditoria de alterações (RNF01, RNF05).

## Tecnologias

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Front-end | React + TypeScript (SPA responsiva) | Um único código-fonte atende desktop e mobile via layout responsivo; TypeScript compartilha tipos com o back-end. |
| Gráficos do dashboard | Recharts | Biblioteca de gráficos React madura, suficiente para os recortes dia/mês/período de RF08. |
| Back-end | Node.js + NestJS + TypeScript | API REST estruturada em módulos, injeção de dependência facilita isolar a lógica de cálculo (tempo parado, custo) em serviços testáveis; TypeScript ponta a ponta. |
| ORM | Prisma | Migrações versionadas e tipagem gerada a partir do schema, reduz erro no filtro obrigatório por `estabelecimento_id`. |
| Banco de dados | PostgreSQL | Suporta bem consultas agregadas do dashboard (RNF03) e índices compostos por `estabelecimento_id`/`unidade_id`. |
| Autenticação | JWT (perfil, `estabelecimentoId`, `unidadeId` no token) | Autorização por perfil e escopo multi-tenant resolvidos a cada requisição sem consulta extra. |
| Empacotamento | Docker (um contêiner por serviço: front, back, banco) | Ambiente reprodutível para desenvolvimento e para a entrega do MVP. |

## Estratégia multi-tenant

Banco de dados compartilhado (não há um banco por Estabelecimento). Toda tabela operacional (`Unidade`, `Entregador`, `Ponto`, `Roteiro`, `Parametro`, `Auditoria`) tem coluna `estabelecimento_id`. Um middleware no back-end injeta o `estabelecimentoId` do token JWT em toda consulta — nenhuma query de aplicação pode omitir esse filtro. Escolhida em vez de schema-por-tenant/banco-por-tenant por ser mais simples de operar no escopo do MVP; o risco de vazamento entre tenants por esquecimento de filtro é mitigado concentrando o filtro no middleware, não em cada endpoint.

## Diagramas

- [`diagrama-componentes.puml`](diagrama-componentes.puml) — componentes do front-end e back-end e suas dependências.
- [`diagrama-execucao.puml`](diagrama-execucao.puml) — nós físicos/contêineres e onde cada componente roda (diagrama de implantação).

## Questões em aberto

- Autenticação federada (SSO) não foi solicitada; assumido login com usuário/senha próprio da aplicação.
- Estratégia de escalonamento (múltiplas instâncias do back-end, cache) não é necessária para o escopo de MVP e não foi detalhada.
- Provisionamento de um novo Estabelecimento (tenant) é operacional, fora do escopo dos diagramas de execução do MVP (ver [ADR-004](../decisoes/ADR-004-multi-tenant-estabelecimento.md)).
