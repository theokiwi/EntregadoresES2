# C3 — Planejamento do dia

## Objetivo do cenário
Cobrir a preparação do roteiro diário: registro dos endereços de entrega recebidos, montagem do roteiro sequencial para um Entregador, e a consulta do Entregador ao seu roteiro do dia antes de sair para as entregas (cenário C4).

## Atores
- **Supervisor local** (UC08, UC09).
- **Entregador** (UC10).

## Casos de uso do cenário
| UC | Nome | Ator | Rastreio |
|---|---|---|---|
| UC08 | Registrar pedidos/endereços de entrega | Supervisor local | Entregáveis (seção 9 da especificação); ver [ADR-006](../../decisoes/ADR-006-pedido-sem-entidade-propria.md) e [ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md) |
| UC09 | Montar roteiro diário | Supervisor local | RF04, RN05, RN06 |
| UC10 | Consultar roteiro do dia | Entregador | Decorrente de RF04/RF05 (requisito implícito, sem RF direto) |

## Pré-condições gerais do cenário
- Supervisor local e Entregador autenticados (UC00), pertencentes à mesma Unidade.
- Entregadores (UC06) já cadastrados na Unidade.
- Base de Pontos (UC07) já possui ao menos os endereços recorrentes; novos endereços podem ser criados sob demanda em UC08.

## Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml).

## Decisões aplicadas neste cenário
- [ADR-006](../../decisoes/ADR-006-pedido-sem-entidade-propria.md) — "Pedido" não é entidade própria, alimenta `Ponto`.
- [ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md) — UC08 reaproveita Ponto existente ou inclui UC07 condicionalmente.
- [ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md) — coordenadas obrigatórias, herdado de UC07.
