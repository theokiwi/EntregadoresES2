# ADR-013: Correção de horário recalcula tempo parado e, se aplicável, os totais do roteiro

## Status
Aceita

## Contexto
`UC16 Corrigir horário de chegada/saída` altera `horaChegada`/`horaSaida` de um Ponto já registrado. Sem uma decisão explícita, o `tempoParado` daquele ponto (RN02) ficaria desatualizado, e se o Roteiro já estivesse "Finalizado" (RN03, RF11), `tempoTotalParado` e `custoEstimado` também ficariam incorretos — o dashboard (RF08) e o custo estimado (UC20) passariam a exibir valores errados após uma correção auditada.

## Decisão
Toda correção feita por `UC16` reaplica os mesmos cálculos de `UC15 Calcular tempo parado` (cenário C4) para o ponto corrigido:
1. Recalcula `tempoParado` do ponto corrigido (RN01/RN02).
2. Se o Roteiro já está "Finalizado", recalcula `tempoTotalParado` somando novamente todos os pontos (RN03, via `UC15` modo total). O status do Roteiro permanece "Finalizado" — a correção não reabre o roteiro para novas chegadas/saídas.
3. `distanciaTotal` e `custoEstimado` (`UC23`) **não** são recalculados por `UC16`: a correção afeta apenas horários, não coordenadas dos pontos, logo distância e custo permanecem inalterados.

## Consequências
- `UC16` inclui `UC15` (modo por ponto e, condicionalmente, modo total) do cenário C4.
- Nenhum recálculo de `UC23` é necessário nesse fluxo.
- O registro de Auditoria (RNF05) guarda o `tempoParado` anterior e o novo, permitindo reconstituir o histórico de indicadores.
