# UC16 — Corrigir horário de chegada/saída

## 1. Cabeçalho
- **ID:** UC16
- **Nome:** Corrigir horário de chegada/saída
- **Cenário(s):** C5 — Correção de registros
- **Ator principal:** Supervisor local
- **Atores secundários:** Sistema (via `«include»` de UC15, cenário C4)
- **Prioridade (MoSCoW):** Should
- **Rastreio:** RNF05 (ver [ADR-013](../../decisoes/ADR-013-recalculo-em-correcao.md))

## 2. Objetivo
Como Supervisor local, quero corrigir um horário de chegada ou saída registrado incorretamente por um Entregador, mantendo um registro auditável da alteração.

## 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado, atuando sobre a Unidade dona do Ponto; o Ponto possui `horaChegada` registrada (correção de saída exige também `horaSaida` já registrada).
**Gatilho:** Supervisor local identifica um horário incorreto (ex.: falha de conectividade no momento do registro original) e aciona "Corrigir horário" na tela do ponto.

## 4. Fluxo principal
1. Supervisor local seleciona o Ponto a corrigir e o campo (`horaChegada` ou `horaSaida`).
2. Sistema exibe o valor atual do campo.
3. Supervisor local informa o novo valor e uma justificativa obrigatória para a correção.
4. Sistema valida o novo valor (ver seção 8).
5. Sistema grava o novo valor no Ponto e cria um registro de Auditoria (autor, data/hora da correção, campo alterado, valor anterior, valor novo, justificativa).
6. Sistema inclui **UC15 Calcular tempo parado** (modo por ponto) para recalcular `tempoParado` do ponto corrigido.
7. Se o Roteiro do ponto está com status "Finalizado", sistema inclui **UC15** (modo total) para recalcular `tempoTotalParado` do roteiro ([ADR-013](../../decisoes/ADR-013-recalculo-em-correcao.md)).
8. Sistema exibe confirmação da correção ao Supervisor local.

## 5. Fluxos alternativos e de exceção
- **3a. Justificativa não informada:** sistema bloqueia o envio e exige preenchimento da justificativa.
- **4a. Novo valor tornaria `horaSaida` anterior ou igual a `horaChegada`:** sistema rejeita a correção e exibe mensagem de validação, sem gravar nada.
- **4b. Ponto é o ponto de partida (ordem 1):** correção de horário é permitida (para fins de registro), mas não gera `tempoParado`, conforme RN01.

## 6. Pós-condições
- **Sucesso:** `Ponto.horaChegada`/`Ponto.horaSaida` atualizado, `Ponto.tempoParado` recalculado, registro de `Auditoria` criado e, se aplicável, `Roteiro.tempoTotalParado` atualizado.
- **Falha:** nenhuma alteração no Ponto, no Roteiro nem na Auditoria.

## 7. Regras de negócio aplicadas
- **RN01** (passo 6/4b): ponto de partida não recebe tempo parado, mesmo após correção.
- **RN02** (passo 6): tempo parado recalculado = nova saída − nova chegada.
- **RN03** (passo 7): tempo total parado recalculado quando o roteiro já está finalizado.

## 8. Dados
- **Leitura:** `Ponto.horaChegada`, `Ponto.horaSaida`, `Ponto.ordem`, `Roteiro.status`.
- **Escrita:** `Ponto.horaChegada` ou `Ponto.horaSaida` (datetime), `Ponto.tempoParado` (recalculado), `Roteiro.tempoTotalParado` (recalculado, se roteiro finalizado), `Auditoria` (novo registro: `autorId`, `dataHoraCorrecao`, `entidade = Ponto`, `campo`, `valorAnterior`, `valorNovo`, `justificativa`).
- **Validação:** `horaSaida > horaChegada` sempre que ambas estiverem presentes; justificativa é campo obrigatório (texto não vazio).

## 9. Critérios de aceitação
- **Dado** um ponto com `horaChegada = 09:15` e `horaSaida = 09:30` (tempoParado = 15 min), **quando** o Supervisor local corrige `horaSaida` para 09:45 com justificativa "registro original com falha de GPS", **então** o sistema grava o novo valor, recalcula `tempoParado = 30 min` e cria um registro de auditoria com os valores 09:30 → 09:45.
- **Dado** uma tentativa de correção sem justificativa, **quando** o Supervisor local tenta salvar, **então** o sistema bloqueia e exige a justificativa.
- **Dado** uma correção que resultaria em `horaSaida` (09:00) anterior à `horaChegada` (09:15), **quando** o Supervisor local tenta salvar, **então** o sistema rejeita a correção e nenhuma alteração é persistida.
- **Dado** um Roteiro já "Finalizado" com `tempoTotalParado = 75 min`, **quando** um de seus pontos tem o tempo parado corrigido de 15 para 30 minutos, **então** o sistema recalcula `tempoTotalParado = 90 min`, mantendo o Roteiro "Finalizado".

## 10. Requisitos não funcionais relevantes
- RNF05 — toda alteração gera registro de auditoria imutável (não editável, não removível).
- RNF01 — persistência com histórico completo (valor anterior nunca é descartado).

## 11. Questões em aberto
Nenhuma — recálculo em cascata resolvido em [ADR-013](../../decisoes/ADR-013-recalculo-em-correcao.md).
