# UC04 — Parametrizar jornada e regras de tempo parado

## 1. Cabeçalho
- **ID:** UC04
- **Nome:** Parametrizar jornada e regras de tempo parado
- **Cenário(s):** C1 — Configuração inicial
- **Ator principal:** Supervisor geral
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Should
- **Rastreio:** RF10, RN04

## 2. Objetivo
Como Supervisor geral, quero configurar a jornada padrão de trabalho de uma Unidade para que os indicadores de tempo parado usem a base percentual correta.

## 3. Pré-condições e gatilho
**Pré-condições:** Unidade cadastrada (UC01); jornada padrão inicial é 8 horas/dia (valor default da especificação) até ser alterada.
**Gatilho:** Supervisor geral acessa "Parametrizar jornada" para uma Unidade.

## 4. Fluxo principal
1. Supervisor geral seleciona a Unidade.
2. Sistema exibe a jornada padrão atual (8h/dia, se nunca configurada).
3. Supervisor geral informa a nova jornada padrão, em horas por dia.
4. Sistema valida que o valor está entre 1 e 24 horas.
5. Sistema grava a jornada padrão da Unidade.
6. Sistema exibe confirmação.

## 5. Fluxos alternativos e de exceção
- **4a. Valor fora do intervalo válido (ex.: 0 ou 30):** sistema bloqueia e informa o intervalo permitido (1–24 horas).

## 6. Pós-condições
- **Sucesso:** `Parametro.jornadaPadraoHoras` atualizado para a Unidade, usado por [UC18](../C6-acompanhamento-e-analise/UC18-visualizar-dashboard.md) como base percentual dos indicadores de tempo parado (RN04).
- **Falha:** valor anterior mantido.

## 7. Regras de negócio aplicadas
- **RN04** (passos 2 e 5): jornada padrão de 8h/dia serve de base percentual para os indicadores de tempo parado; este UC é onde esse valor é definido/ajustado por Unidade.

## 8. Dados
- **Escrita:** `Parametro` (unidadeId, jornadaPadraoHoras: inteiro, 1–24, default 8).

## 9. Critérios de aceitação
- **Dado** uma Unidade recém-cadastrada sem parametrização prévia, **quando** o sistema consulta a jornada padrão, **então** retorna 8 horas/dia (default da especificação).
- **Dado** a unidade "Filial Centro", **quando** o Supervisor geral altera a jornada padrão para 6 horas, **então** `Parametro.jornadaPadraoHoras = 6` passa a ser usado nos indicadores de dashboard dessa Unidade.
- **Dado** o valor `30` informado, **quando** o Supervisor geral tenta salvar, **então** o sistema bloqueia por estar fora do intervalo 1–24.

## 10. Requisitos não funcionais relevantes
- Constituição, item 8 — parametrização sem alteração de código.

## 11. Questões em aberto
Nenhuma.
