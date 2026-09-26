# UC19 — Consultar histórico de pontos e tempos com endereços

## 1. Cabeçalho
- **ID:** UC19
- **Nome:** Consultar histórico de pontos e tempos com endereços
- **Cenário(s):** C6 — Acompanhamento e análise
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF07

## 2. Objetivo
Como Supervisor local, quero consultar o histórico detalhado de pontos e tempos parados por período, com os endereços de cada ponto, para investigar a operação de qualquer Entregador da minha Unidade.

## 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado.
**Gatilho:** Supervisor local acessa a tela de histórico e informa um período (e, opcionalmente, um Entregador específico).

## 4. Fluxo principal
1. Supervisor local acessa a tela de histórico.
2. Supervisor local informa o período (data inicial e final) e, opcionalmente, filtra por Entregador.
3. Sistema busca os Roteiros finalizados da Unidade no período, com seus Pontos (endereço, horaChegada, horaSaida, tempoParado).
4. Sistema exibe a lista de Roteiros e, para cada um, os Pontos em ordem sequencial com endereço e tempo parado.

## 5. Fluxos alternativos e de exceção
- **2a. Período inválido (data final anterior à inicial):** sistema bloqueia e solicita um intervalo válido.
- **3a. Nenhum roteiro no período/filtro informado:** sistema exibe "Nenhum registro encontrado para os filtros selecionados".

## 6. Pós-condições
- **Sucesso:** lista de Roteiros e Pontos do período exibida.
- **Falha:** nenhum dado exibido.

## 7. Regras de negócio aplicadas
Nenhuma RN de negócio diretamente aplicável — consulta de dados já calculados por UC15 (cenário C4).

## 8. Dados
- **Leitura:** `Roteiro` (data, entregadorId, unidadeId, status), `Ponto` (endereço, ordem, horaChegada, horaSaida, tempoParado), filtrados por `unidadeId` do Supervisor local autenticado.
- **Escrita:** nenhuma.

## 9. Critérios de aceitação
- **Dado** um roteiro finalizado em 20/09/2026 com 4 pontos e seus endereços/tempos parados, **quando** o Supervisor local consulta o histórico desse período, **então** o sistema exibe o roteiro com os 4 pontos, cada um com endereço e tempo parado.
- **Dado** um filtro por Entregador específico sem nenhum roteiro no período, **quando** o Supervisor local consulta, **então** o sistema exibe "Nenhum registro encontrado para os filtros selecionados".
- **Dado** um período com data final anterior à inicial, **quando** o Supervisor local tenta consultar, **então** o sistema bloqueia e solicita um intervalo válido.

## 10. Requisitos não funcionais relevantes
- RNF01 — depende da persistência do histórico completo.

## 11. Questões em aberto
Nenhuma.
