# UC22 — Consultar o próprio histórico

## 1. Cabeçalho
- **ID:** UC22
- **Nome:** Consultar o próprio histórico
- **Cenário(s):** C6 — Acompanhamento e análise
- **Ator principal:** Entregador
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Should
- **Rastreio:** RF07, RNF06 (ver [ADR-003](../../decisoes/ADR-003-historico-entregador.md) — Entregador só acessa o próprio histórico)

## 2. Objetivo
Como Entregador, quero consultar meu próprio histórico de roteiros, pontos e tempos parados, para acompanhar meu desempenho.

## 3. Pré-condições e gatilho
**Pré-condições:** Entregador autenticado.
**Gatilho:** Entregador acessa a tela "Meu histórico".

## 4. Fluxo principal
1. Entregador acessa a tela "Meu histórico".
2. Entregador informa um período (data inicial e final).
3. Sistema busca os Roteiros finalizados do próprio Entregador autenticado (`entregadorId` = id do usuário logado) no período informado, com seus Pontos e tempos parados.
4. Sistema exibe a lista de Roteiros e Pontos do próprio Entregador.

## 5. Fluxos alternativos e de exceção
- **2a. Período inválido (data final anterior à inicial):** sistema bloqueia e solicita um intervalo válido.
- **3a. Nenhum roteiro finalizado no período:** sistema exibe "Nenhum registro encontrado para o período selecionado".
- **3b. Tentativa de acessar histórico de outro entregador (ex.: manipulação de parâmetro na requisição):** sistema bloqueia a consulta — o filtro por `entregadorId` do próprio usuário autenticado é aplicado obrigatoriamente pelo back-end, nunca informado pelo cliente (RNF06, LGPD).

## 6. Pós-condições
- **Sucesso:** histórico do próprio Entregador exibido.
- **Falha:** nenhum dado exibido.

## 7. Regras de negócio aplicadas
Nenhuma RN de negócio diretamente aplicável — consulta de dados já calculados por UC15 (cenário C4), restrita ao próprio Entregador.

## 8. Dados
- **Leitura:** `Roteiro` (data, entregadorId, tempoTotalParado, status), `Ponto` (endereço, horaChegada, horaSaida, tempoParado), filtrados obrigatoriamente por `entregadorId` = id do Entregador autenticado.
- **Escrita:** nenhuma.

## 9. Critérios de aceitação
- **Dado** o entregador João com 2 roteiros finalizados em setembro/2026, **quando** ele consulta seu histórico desse período, **então** o sistema exibe apenas os 2 roteiros de João, com seus pontos e tempos.
- **Dado** o entregador João autenticado, **quando** ele tenta consultar (por qualquer meio) o histórico do entregador Maria, **então** o sistema bloqueia e retorna apenas dados do próprio João, nunca de Maria.
- **Dado** um período sem roteiros finalizados de João, **quando** ele consulta, **então** o sistema exibe "Nenhum registro encontrado para o período selecionado".

## 10. Requisitos não funcionais relevantes
- **RNF06** — aderência à LGPD: minimização de dados pessoais, acesso restrito ao próprio titular dos dados.
- RNF02 — interface responsiva/mobile.

## 11. Questões em aberto
Nenhuma.
