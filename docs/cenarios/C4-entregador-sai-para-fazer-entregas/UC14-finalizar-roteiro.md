# UC14 — Finalizar roteiro

## 1. Cabeçalho
- **ID:** UC14
- **Nome:** Finalizar roteiro
- **Cenário(s):** C4 — Entregador sai para fazer entregas
- **Ator principal:** Entregador
- **Atores secundários:** Sistema (via `«include»` de UC15 e UC23)
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF06, RN03 (ver [ADR-011](../../decisoes/ADR-011-finalizacao-exige-todos-pontos.md))

## 2. Objetivo
Como Entregador, quero finalizar meu roteiro ao concluir todas as entregas, para que o sistema calcule o tempo total parado e o custo do trajeto.

## 3. Pré-condições e gatilho
**Pré-condições:** Roteiro em status "Em andamento".
**Gatilho:** Entregador registra a saída do último ponto do roteiro, ou aciona "Finalizar roteiro" manualmente.

## 4. Fluxo principal
1. Entregador registra a saída do último ponto do roteiro (UC13) ou aciona "Finalizar roteiro".
2. Sistema verifica que todos os pontos da sequência têm saída registrada (RN06). Finalização com pontos pendentes não é permitida ([ADR-011](../../decisoes/ADR-011-finalizacao-exige-todos-pontos.md)).
3. Sistema inclui **UC15 Calcular tempo parado** (modo total) para somar o tempo parado de todos os pontos, exceto o de partida (RN03).
4. Sistema inclui **UC23 Calcular distância e custo do roteiro** para computar a distância percorrida e o custo estimado (RN07).
5. Sistema grava o horário de término, o tempo total parado, a distância total e o custo estimado no roteiro, e atualiza o status para "Finalizado".
6. Sistema exibe ao Entregador um resumo do roteiro concluído.

## 5. Fluxos alternativos e de exceção
- **1a. Entregador aciona "Finalizar roteiro" com pontos pendentes:** sistema bloqueia a finalização e informa quais pontos ainda não têm saída registrada ([ADR-011](../../decisoes/ADR-011-finalizacao-exige-todos-pontos.md)). Não há finalização parcial.
- **5a. Roteiro já finalizado:** sistema informa e exibe o resumo já calculado, sem recalcular.

## 6. Pós-condições
- **Sucesso:** `Roteiro.status = Finalizado`, `horaTermino`, `tempoTotalParado`, `distanciaTotal`, `custoEstimado` preenchidos.
- **Falha:** roteiro permanece "Em andamento".

## 7. Regras de negócio aplicadas
- **RN03** (passo 3, via UC15): tempo total parado = soma dos tempos parados de todos os pontos, exceto o de partida.
- **RN06** (passo 2): verificação de que todos os pontos da sequência foram visitados.
- **RN07** (passo 4, via UC23): custo do trajeto a partir de combustível, rendimento km/litro e distância.

## 8. Dados
- **Leitura:** `Roteiro.pontos` (todos, com `tempoParado` individual e coordenadas).
- **Escrita:** `Roteiro.tempoTotalParado`, `Roteiro.distanciaTotal`, `Roteiro.custoEstimado`, `Roteiro.horaTermino`, `Roteiro.status`.

## 9. Critérios de aceitação
- **Dado** o roteiro A com pontos 2, 3 e 4 com tempos parados de 15, 10 e 50 minutos, **quando** o entregador registra a saída do último ponto, **então** o sistema finaliza o roteiro com `tempoTotalParado = 75 min`.
- **Dado** um roteiro com distância total calculada de 42 km, combustível a R$ 6,00/L e rendimento de 12 km/L, **quando** o roteiro é finalizado, **então** o sistema calcula `custoEstimado = (42 ÷ 12) × 6,00 = R$ 21,00`.
- **Dado** um roteiro já finalizado, **quando** o entregador tenta finalizá-lo novamente, **então** o sistema exibe o resumo já calculado sem reprocessar.

## 10. Requisitos não funcionais relevantes
- RNF01 — persistência garantindo histórico completo do roteiro.

## 11. Questões em aberto
Nenhuma — resolvida via [ADR-011](../../decisoes/ADR-011-finalizacao-exige-todos-pontos.md). Retomada/cancelamento de um roteiro incompleto em outro dia está fora do escopo do MVP.
