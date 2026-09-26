# C2 — Montagem da equipe e da base de pontos

## Objetivo do cenário
Cobrir o cadastro da base operacional de uma Unidade antes do planejamento diário: os entregadores que executarão os roteiros e os pontos (endereços geolocalizados) que poderão compor um roteiro.

## Atores
- **Supervisor local** (ator principal de UC06 e UC07).

## Casos de uso do cenário
| UC | Nome | Rastreio |
|---|---|---|
| UC06 | Cadastrar entregador (veículo, km/litro) | RF01 |
| UC07 | Cadastrar ponto (endereço, coordenadas) | RF03 |

## Pré-condições gerais do cenário
- Supervisor local autenticado (UC00), pertencente a uma Unidade de um Estabelecimento.
- Toda entidade criada neste cenário (`Entregador`, `Ponto`) é automaticamente associada à Unidade do Supervisor local autenticado — nunca a outra Unidade ([ADR-001](../../decisoes/ADR-001-unidade.md), [ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md)).

## Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml).

## Decisões aplicadas neste cenário
- [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md) — rendimento km/litro é atributo do Entregador/veículo, cadastrado em UC06 (não em UC03/Parâmetro).
- [ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md) — latitude/longitude são obrigatórias em UC07, eliminando estruturalmente o caso de Ponto sem coordenadas usado depois em UC23.
