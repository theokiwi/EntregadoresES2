# UC13 — Registrar saída do ponto

## 1. Cabeçalho
- **ID:** UC13
- **Nome:** Registrar saída do ponto
- **Cenário(s):** C4 — Entregador sai para fazer entregas
- **Ator principal:** Entregador
- **Atores secundários:** Sistema (via `«include»` de UC15)
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF05

## 2. Objetivo
Como Entregador, quero registrar minha saída do ponto atual para que o sistema calcule o tempo que fiquei parado ali.

## 3. Pré-condições e gatilho
**Pré-condições:** Ponto atual com `horaChegada` registrada (UC12) e sem `horaSaida`.
**Gatilho:** Entregador está de saída do ponto e aciona "Registrar saída".

## 4. Fluxo principal
1. Entregador acessa a tela do ponto atual (com chegada já registrada).
2. Entregador confirma "Registrar saída".
3. Sistema grava a data/hora de saída do ponto.
4. Sistema inclui **UC15 Calcular tempo parado** para calcular o tempo parado deste ponto (RN02), aplicando a exclusão do ponto de partida quando cabível (RN01).
5. Sistema atualiza o status do ponto para "Concluído" e libera o próximo ponto da sequência (RN06).

## 5. Fluxos alternativos e de exceção
- **2a. Saída já registrada:** sistema informa e não duplica o registro.
- **2b. Chegada ainda não registrada neste ponto:** sistema bloqueia o registro de saída e solicita registrar a chegada primeiro.

## 6. Pós-condições
- **Sucesso:** `Ponto.horaSaida` preenchido; `Ponto.tempoParado` calculado (exceto ponto de partida); status "Concluído".
- **Falha:** nenhuma alteração.

## 7. Regras de negócio aplicadas
- **RN01** (passo 4, via UC15): ponto de partida não recebe tempo parado.
- **RN02** (passo 4, via UC15): tempo parado = horaSaida − horaChegada.
- **RN06** (passo 5): liberação do próximo ponto conforme ordem sequencial.

## 8. Dados
- **Leitura:** `Ponto.horaChegada`, `Ponto.ordem`.
- **Escrita:** `Ponto.horaSaida` (datetime), `Ponto.tempoParado` (derivado, via UC15), `Ponto.status`.

## 9. Critérios de aceitação
- **Dado** o ponto 2 com chegada às 09:15, **quando** o entregador registra saída às 09:30, **então** o sistema grava `horaSaida = 09:30` e calcula `tempoParado = 15 min` para o ponto 2.
- **Dado** o ponto 1 (partida), **quando** o entregador registra sua saída, **então** o sistema grava `horaSaida` mas não contabiliza `tempoParado` (RN01).
- **Dado** que a chegada no ponto 3 ainda não foi registrada, **quando** o entregador tenta registrar a saída, **então** o sistema bloqueia e solicita o registro de chegada primeiro.

## 10. Requisitos não funcionais relevantes
- RNF01 — persistência garantindo histórico completo.
- RNF02 — interface responsiva/mobile.

## 11. Questões em aberto
Nenhuma além das já registradas em UC12.
