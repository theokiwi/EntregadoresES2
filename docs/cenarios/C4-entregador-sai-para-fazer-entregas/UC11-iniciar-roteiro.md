# UC11 — Iniciar roteiro

## 1. Cabeçalho
- **ID:** UC11
- **Nome:** Iniciar roteiro
- **Cenário(s):** C4 — Entregador sai para fazer entregas
- **Ator principal:** Entregador
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RN01

## 2. Objetivo
Como Entregador, quero iniciar meu roteiro do dia para começar o registro de execução das entregas.

## 3. Pré-condições e gatilho
**Pré-condições:** Entregador autenticado; existe Roteiro montado (UC09) para o Entregador na data corrente, com status "Não iniciado".
**Gatilho:** Entregador aciona "Iniciar roteiro" na tela do roteiro do dia (UC10).

## 4. Fluxo principal
1. Entregador acessa a tela do roteiro do dia.
2. Sistema exibe os pontos do roteiro em ordem sequencial (RN06), com endereço e ordem.
3. Entregador seleciona "Iniciar roteiro".
4. Sistema registra o horário de início do roteiro e marca o ponto de partida (ordem 1) como visitado, sem contabilizar tempo parado para ele (RN01).
5. Sistema atualiza o status do roteiro para "Em andamento" e libera o registro de chegada no próximo ponto.

## 5. Fluxos alternativos e de exceção
- **3a. Roteiro já iniciado:** sistema informa que o roteiro já está em andamento e exibe o próximo ponto pendente, sem duplicar o início.
- **3b. Não existe roteiro montado para a data corrente:** sistema exibe "Nenhum roteiro disponível para hoje" e a ação "Iniciar roteiro" fica indisponível.

## 6. Pós-condições
- **Sucesso:** Roteiro com status "Em andamento", horário de início registrado, ponto de partida marcado sem tempo parado.
- **Falha:** nenhum estado alterado; roteiro permanece no status anterior.

## 7. Regras de negócio aplicadas
- **RN01** (passo 4): o ponto de partida não conta tempo parado.
- **RN06** (passo 2): pontos exibidos na ordem sequencial definida na montagem do roteiro.

## 8. Dados
- **Leitura:** `Roteiro` (id, data, entregadorId, unidadeId, status, pontos ordenados).
- **Escrita:** `Roteiro.horaInicio` (datetime), `Roteiro.status` (enum: `NaoIniciado`|`EmAndamento`|`Finalizado`).

## 9. Critérios de aceitação
- **Dado** um roteiro montado para o entregador João, unidade Centro, na data de hoje, com 4 pontos, **quando** ele inicia o roteiro, **então** o status muda para "Em andamento", o horário de início é registrado e o ponto 1 não recebe tempo parado.
- **Dado** um roteiro já em andamento, **quando** o entregador tenta iniciar novamente, **então** o sistema mantém o estado atual e informa que o roteiro já foi iniciado.
- **Dado** que não há roteiro montado para hoje, **quando** o entregador acessa a tela do roteiro do dia, **então** o sistema exibe "Nenhum roteiro disponível para hoje" e a ação iniciar roteiro fica indisponível.

## 10. Requisitos não funcionais relevantes
- RNF02 — interface responsiva, pois o Entregador acessa via dispositivo móvel em campo.

## 11. Questões em aberto
- A especificação não define se há restrição de horário para iniciar o roteiro (ex.: fora da jornada padrão). Assumido que o sistema permite iniciar a qualquer momento do dia da data do roteiro.
