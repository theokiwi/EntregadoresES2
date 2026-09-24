# C5 — Correção de registros

## Objetivo do cenário
Permitir que o Supervisor local corrija erros de registro de horário de chegada/saída em pontos do roteiro, com auditoria obrigatória e recálculo automático dos indicadores derivados, e consulte o histórico dessas correções.

## Atores
- **Supervisor local** (ator principal de UC16 e UC17).
- **Sistema** (recalcula tempo parado via `UC15`, cenário C4, incluído por UC16 quando aplicável).

## Casos de uso do cenário
| UC | Nome | Rastreio |
|---|---|---|
| UC16 | Corrigir horário de chegada/saída (gera auditoria) | RNF05 |
| UC17 | Consultar trilha de auditoria | RNF05 |

## Pré-condições gerais do cenário
- Supervisor local autenticado (UC00), atuando sobre sua própria Unidade (isolamento por Unidade/Estabelecimento, [constituição](../../constituicao.md) itens 1–2).
- Existe um Ponto já registrado (com `horaChegada` e, opcionalmente, `horaSaida`) pertencente a um Roteiro da Unidade do Supervisor.

## Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml).

## Decisões aplicadas neste cenário
- [Constituição, item 4](../../constituicao.md) — auditoria obrigatória de toda alteração manual em registro de tempo.
- [ADR-011](../../decisoes/ADR-011-finalizacao-exige-todos-pontos.md) — Roteiro finalizado não reabre para novos registros de chegada/saída; correção via UC16 é a única forma de alterar horários após a finalização.
- [ADR-013](../../decisoes/ADR-013-recalculo-em-correcao.md) — correção recalcula tempo parado do ponto e, se o roteiro já estava finalizado, o total do roteiro, reaproveitando UC15 (cenário C4).
