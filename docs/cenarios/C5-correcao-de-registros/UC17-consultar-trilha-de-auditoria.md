# UC17 — Consultar trilha de auditoria

## 1. Cabeçalho
- **ID:** UC17
- **Nome:** Consultar trilha de auditoria
- **Cenário(s):** C5 — Correção de registros
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Could
- **Rastreio:** RNF05

## 2. Objetivo
Como Supervisor local, quero consultar o histórico de correções manuais feitas em registros da minha Unidade, para auditar quem alterou o quê e por quê.

## 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado; existem registros de Auditoria gerados por UC16 na sua Unidade.
**Gatilho:** Supervisor local acessa a tela "Trilha de auditoria".

## 4. Fluxo principal
1. Supervisor local acessa a tela de trilha de auditoria.
2. Supervisor local informa um filtro de período (data inicial e final).
3. Sistema busca os registros de Auditoria da Unidade do Supervisor local dentro do período informado.
4. Sistema exibe a lista ordenada por data/hora decrescente, com autor, ponto/roteiro afetado, campo alterado, valor anterior, valor novo e justificativa.

## 5. Fluxos alternativos e de exceção
- **3a. Nenhum registro de auditoria no período:** sistema exibe lista vazia com mensagem "Nenhuma correção registrada no período".
- **2a. Período não informado:** sistema aplica um período padrão (últimos 30 dias).

## 6. Pós-condições
- **Sucesso:** lista de registros de Auditoria exibida, restrita à Unidade do Supervisor local.
- **Falha:** não se aplica (consulta somente leitura).

## 7. Regras de negócio aplicadas
Nenhuma RN diretamente; aplica o princípio de isolamento por Unidade ([constituição](../../constituicao.md), item 2).

## 8. Dados
- **Leitura:** `Auditoria` (autorId, dataHoraCorrecao, entidade, campo, valorAnterior, valorNovo, justificativa, unidadeId).

## 9. Critérios de aceitação
- **Dado** que existem 3 correções registradas na Unidade Centro no último mês, **quando** o Supervisor local dessa Unidade consulta a trilha de auditoria do período, **então** o sistema exibe as 3 correções, mais recente primeiro.
- **Dado** que uma correção foi feita em outra Unidade, **quando** o Supervisor local consulta a trilha de auditoria, **então** essa correção não aparece na lista (isolamento por Unidade).
- **Dado** nenhum filtro de período informado, **quando** o Supervisor local acessa a tela, **então** o sistema exibe as correções dos últimos 30 dias por padrão.

## 10. Requisitos não funcionais relevantes
- RNF05 — trilha de auditoria completa e imutável.
- RNF03 (por analogia ao dashboard) — consulta deve responder em tempo hábil mesmo com histórico extenso; sem exigência numérica explícita da especificação para este UC.

## 11. Questões em aberto
Nenhuma.
