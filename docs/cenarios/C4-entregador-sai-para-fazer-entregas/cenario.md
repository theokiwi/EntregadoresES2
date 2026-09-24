# C4 — Entregador sai para fazer entregas

## Objetivo do cenário
Cobrir a execução do roteiro diário em campo: o entregador inicia o roteiro, registra chegada e saída em cada ponto, finaliza o roteiro e o sistema calcula automaticamente o tempo parado e o custo estimado.

## Atores
- **Entregador** (ator principal de UC11–UC14).
- **Sistema** (ator dos casos de uso incluídos UC15 e UC23, sem interação humana direta).

## Casos de uso do cenário
| UC | Nome | Rastreio |
|---|---|---|
| UC11 | Iniciar roteiro | RN01 |
| UC12 | Registrar chegada no ponto | RF05 |
| UC13 | Registrar saída do ponto | RF05 |
| UC14 | Finalizar roteiro | RF06, RN03 |
| UC15 | Calcular tempo parado (sistema, `«include»` de UC13 e UC14) | RF06, RN01, RN02, RN03 |
| UC23 | Calcular distância e custo do roteiro (sistema, `«include»` de UC14) | RF11, RN07 |

## Pré-condições gerais do cenário
- Entregador autenticado (UC00), pertencente a uma Unidade de um Estabelecimento.
- Existe um Roteiro montado (UC09) para o Entregador na data corrente, com Pontos em ordem sequencial (RN06) e coordenadas cadastradas (RF03).
- Parâmetros de custo (UC03) e rendimento km/litro do Entregador (UC06) cadastrados.

## Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml).

## Decisões aplicadas neste cenário
- [ADR-002](../../decisoes/ADR-002-distancia-haversine.md) — distância calculada pelo sistema.
- [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md) — rendimento km/litro é atributo do Entregador.
- [ADR-007](../../decisoes/ADR-007-calculo-custo-roteiro-uc-dedicado.md) — UC15 e UC23 como casos de uso de sistema dedicados a cálculo, incluídos por UC13/UC14.
