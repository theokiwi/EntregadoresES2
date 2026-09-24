# UC10 — Consultar roteiro do dia

## 1. Cabeçalho
- **ID:** UC10
- **Nome:** Consultar roteiro do dia
- **Cenário(s):** C3 — Planejamento do dia (pré-requisito do cenário C4)
- **Ator principal:** Entregador
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** Decorrente de RF04/RF05 — requisito implícito, sem RF direto na especificação (RF04 cobre a montagem do roteiro, não a consulta; a consulta é necessária para o Entregador executar `UC11`–`UC14` do cenário C4).

## 2. Objetivo
Como Entregador, quero consultar meu roteiro do dia para saber quais pontos visitar e em que ordem.

## 3. Pré-condições e gatilho
**Pré-condições:** Entregador autenticado.
**Gatilho:** Entregador acessa a tela inicial do aplicativo no dia.

## 4. Fluxo principal
1. Entregador acessa a tela "Meu roteiro do dia".
2. Sistema busca o Roteiro do Entregador autenticado para a data corrente.
3. Sistema exibe os pontos do roteiro em ordem sequencial (RN06), com endereço, ordem e status de cada um (pendente/concluído).

## 5. Fluxos alternativos e de exceção
- **2a. Não existe roteiro para a data corrente:** sistema exibe "Nenhum roteiro disponível para hoje".

## 6. Pós-condições
- **Sucesso:** roteiro do dia exibido ao Entregador.
- **Falha:** mensagem de ausência de roteiro exibida; nenhum dado alterado.

## 7. Regras de negócio aplicadas
- **RN06** (passo 3): exibição respeita a ordem sequencial definida na montagem do roteiro.

## 8. Dados
- **Leitura:** `Roteiro` (do Entregador autenticado, filtrando por `entregadorId` e data corrente), `Ponto` (endereço, ordem, status).

## 9. Critérios de aceitação
- **Dado** que existe um roteiro montado para a entregadora Maria na data de hoje com 4 pontos, **quando** ela acessa "Meu roteiro do dia", **então** o sistema exibe os 4 pontos na ordem sequencial definida.
- **Dado** que não existe roteiro montado para o Entregador hoje, **quando** ele acessa a tela, **então** o sistema exibe "Nenhum roteiro disponível para hoje".

## 10. Requisitos não funcionais relevantes
- RNF02 — interface responsiva/mobile: é a tela principal usada pelo Entregador em campo.

## 11. Questões em aberto
Nenhuma.
