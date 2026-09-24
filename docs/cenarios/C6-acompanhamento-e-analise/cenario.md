# C6 — Acompanhamento e análise

## Objetivo do cenário
Permitir que o Supervisor acompanhe o desempenho operacional da sua Unidade (tempo parado, custos, histórico) através de um dashboard e consultas detalhadas, e que o Entregador consulte o próprio histórico. Cobre a exportação de relatórios para uso fora do sistema.

## Atores
- **Supervisor local** (ator principal de UC18–UC21).
- **Entregador** (ator principal de UC22).

## Casos de uso do cenário
| UC | Nome | Rastreio |
|---|---|---|
| UC18 | Visualizar dashboard de tempo parado (dia/mês/período) | RF08, RNF03 |
| UC19 | Consultar histórico de pontos e tempos com endereços | RF07 |
| UC20 | Consultar custo estimado do roteiro | RF11 |
| UC21 | Exportar relatório — `«extend»` de UC18 e UC19 | RF12 |
| UC22 | Consultar o próprio histórico | RF07, RNF06 |

## Pré-condições gerais do cenário
- Ator autenticado (UC00), pertencente a uma Unidade de um Estabelecimento.
- Existem Roteiros finalizados (UC14, cenário C4) com tempo parado, distância e custo calculados (UC15, UC23) para consulta.

## Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml).

## Decisões aplicadas neste cenário
- [ADR-003](../../decisoes/ADR-003-historico-entregador.md) — Entregador só consulta o próprio histórico (UC22).
- [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md) e [ADR-007](../../decisoes/ADR-007-calculo-custo-roteiro-uc-dedicado.md) — UC20 é uma consulta ao custo já calculado por UC23 (cenário C4); não recalcula.
- Formato de exportação de UC21 decidido como CSV (ver spec do UC21) por simplicidade de implementação no MVP, sem necessidade de biblioteca de geração de PDF.
