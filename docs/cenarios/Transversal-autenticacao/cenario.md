# Transversal — Autenticação

## Objetivo do cenário
Modelar, uma única vez, o login de qualquer ator do sistema (Entregador, Supervisor local, Supervisor geral) e a resolução do seu perfil, Unidade e Estabelecimento — pré-requisito textual de todos os demais casos de uso, sem aparecer como `«include»` em cada um deles.

## Atores
- **Entregador**, **Supervisor local**, **Supervisor geral** (ver [atores.md](../../atores.md)). Supervisor geral herda Supervisor local (generalização de atores).

## Caso de uso do cenário
| UC | Nome | Ator | Rastreio |
|---|---|---|---|
| UC00 | Autenticar-se | Todos | RNF04 |

## Pré-condições gerais do cenário
- O usuário possui uma credencial (e-mail/senha) previamente cadastrada por um Supervisor (UC02 Cadastrar supervisor local, UC05 Gerenciar perfis de acesso, UC06 Cadastrar entregador), associada a um perfil fixo ([ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md)) e, quando aplicável, a uma Unidade dentro de um Estabelecimento ([ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md)).

## Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml). Único ponto do projeto em que a generalização de atores Supervisor geral → Supervisor local é desenhada (repetida textualmente em C1, mas o diagrama vive aqui).

## Decisão de modelagem (não reaberta)
Autenticação é modelada uma única vez, neste diagrama transversal. Nenhum outro caso de uso usa `«include»` de UC00 — a pré-condição "ator autenticado" é apenas textual nas demais specs.

## Decisões aplicadas neste cenário
- [ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md) — login resolve Estabelecimento e Unidade do usuário.
- [ADR-008](../../decisoes/ADR-008-stack-tecnologico.md) — sessão via JWT com claims de perfil, `estabelecimentoId`, `unidadeId`.
- [ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md) — três perfis fixos resolvidos no login.
