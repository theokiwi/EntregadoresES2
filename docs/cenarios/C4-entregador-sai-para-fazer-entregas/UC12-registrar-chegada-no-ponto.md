# UC12 — Registrar chegada no ponto

## 1. Cabeçalho
- **ID:** UC12
- **Nome:** Registrar chegada no ponto
- **Cenário(s):** C4 — Entregador sai para fazer entregas
- **Ator principal:** Entregador
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF05

## 2. Objetivo
Como Entregador, quero registrar minha chegada no ponto atual do roteiro para iniciar a contagem do tempo parado.

## 3. Pré-condições e gatilho
**Pré-condições:** Roteiro em status "Em andamento"; o ponto é o próximo da sequência ainda não visitado (RN06).
**Gatilho:** Entregador chega fisicamente ao ponto e aciona "Registrar chegada".

## 4. Fluxo principal
1. Entregador acessa a tela de registro do ponto atual.
2. Sistema exibe o ponto esperado (endereço, ordem), conforme RN06.
3. Entregador confirma "Registrar chegada".
4. Sistema grava a data/hora de chegada no ponto corrente.
5. Sistema atualiza o status do ponto para "Aguardando saída".

## 5. Fluxos alternativos e de exceção
- **3a. Tentativa de registrar chegada em ponto fora de ordem:** sistema bloqueia e informa qual é o próximo ponto esperado (RN06).
- **4a. Chegada já registrada para este ponto:** sistema informa que a chegada já foi registrada e não permite duplicar.

## 6. Pós-condições
- **Sucesso:** `Ponto.horaChegada` preenchido; status do ponto "Aguardando saída".
- **Falha:** nenhuma alteração no ponto.

## 7. Regras de negócio aplicadas
- **RN06** (passos 2 e 3a): pontos só podem ser registrados na ordem sequencial definida no roteiro.

## 8. Dados
- **Leitura:** `Roteiro.pontos` (ordem, status de cada ponto).
- **Escrita:** `Ponto.horaChegada` (datetime), `Ponto.status` (enum: `Pendente`|`AguardandoSaida`|`Concluido`).

## 9. Critérios de aceitação
- **Dado** o roteiro da entregadora Maria em andamento, com o ponto 2 (Rua Peru, 55) como próximo pendente, **quando** ela registra a chegada às 09:15, **então** o sistema grava `horaChegada = 09:15` no ponto 2 e muda seu status para "Aguardando saída".
- **Dado** que o ponto 3 ainda não é o próximo esperado (ponto 2 pendente), **quando** o entregador tenta registrar chegada no ponto 3, **então** o sistema bloqueia e informa que o próximo ponto esperado é o 2.
- **Dado** que a chegada no ponto 2 já foi registrada, **quando** o entregador tenta registrar novamente, **então** o sistema informa que já existe um registro de chegada para esse ponto.

## 10. Requisitos não funcionais relevantes
- RNF01 — persistência garantindo histórico completo.
- RNF02 — interface responsiva/mobile.

## 11. Questões em aberto
- A especificação não define validação de geolocalização (o sistema confirmar que o entregador está fisicamente no endereço do ponto). Assumido registro por confirmação manual, sem validação de GPS — telemetria em tempo real está fora do escopo (seção 3.2 da especificação).
