# UC09 — Montar roteiro diário

## 1. Cabeçalho
- **ID:** UC09
- **Nome:** Montar roteiro diário
- **Cenário(s):** C3 — Planejamento do dia
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF04, RN05, RN06

## 2. Objetivo
Como Supervisor local, quero montar o roteiro diário de um Entregador, associando Pontos em ordem sequencial, para que ele saiba quais entregas fazer e em que ordem.

## 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado; existem Pontos cadastrados na base da Unidade (UC07/UC08); Entregador cadastrado na Unidade (UC06).
**Gatilho:** Supervisor local decide montar o roteiro do dia para um Entregador.

## 4. Fluxo principal
1. Supervisor local acessa a tela de montagem de roteiro e seleciona o Entregador e a data.
2. Sistema verifica se já existe um Roteiro para esse Entregador nessa data (RN05).
3. Supervisor local seleciona os Pontos a incluir no roteiro, a partir da base de Pontos da Unidade.
4. Supervisor local define a ordem sequencial dos Pontos (RN06), incluindo qual é o ponto de partida.
5. Sistema salva o Roteiro com status "Não iniciado", associado ao Entregador, à data e à lista ordenada de Pontos.

## 5. Fluxos alternativos e de exceção
- **2a. Já existe um Roteiro para esse Entregador nessa data:** sistema bloqueia a criação de um novo roteiro e oferece editar o roteiro existente (RN05).
- **3a. Nenhum ponto selecionado:** sistema impede salvar um roteiro vazio.

## 6. Pós-condições
- **Sucesso:** Roteiro criado, status "Não iniciado", Pontos em ordem sequencial, associado a um único Entregador e uma única data.
- **Falha:** nenhum roteiro criado ou alterado.

## 7. Regras de negócio aplicadas
- **RN05** (passo 2/2a): cada Roteiro pertence a um único Entregador e a uma única data.
- **RN06** (passo 4): os pontos de um roteiro possuem ordem sequencial que define o trajeto do dia.

## 8. Dados
- **Leitura:** `Ponto` (base da Unidade), `Entregador`.
- **Escrita:** `Roteiro` (id, data, entregadorId, unidadeId, status = `NaoIniciado`, lista ordenada de pontos).

## 9. Critérios de aceitação
- **Dado** o entregador João sem roteiro cadastrado para 2026-09-24, **quando** o Supervisor local monta um roteiro com os pontos A, B e C nessa ordem, **então** o sistema cria o Roteiro com status "Não iniciado" e os pontos na sequência 1, 2, 3.
- **Dado** que o entregador João já possui um roteiro para 2026-09-24, **quando** o Supervisor local tenta montar um novo roteiro para ele nessa mesma data, **então** o sistema bloqueia a criação e sugere editar o roteiro existente.
- **Dado** que nenhum ponto foi selecionado, **quando** o Supervisor local tenta salvar o roteiro, **então** o sistema impede o salvamento e informa que é necessário ao menos um ponto.

## 10. Requisitos não funcionais relevantes
- RNF01 — persistência garantindo histórico completo.

## 11. Questões em aberto
A especificação não define um número mínimo de pontos por roteiro além de implicitamente "ao menos um" (o ponto de partida). Assumido 1 como mínimo — decisão de implementação, não uma questão de negócio que exija validação do cliente.
