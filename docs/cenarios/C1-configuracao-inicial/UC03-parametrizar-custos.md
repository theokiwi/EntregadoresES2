# UC03 — Parametrizar custos

## 1. Cabeçalho
- **ID:** UC03
- **Nome:** Parametrizar custos (combustível, custo/km)
- **Cenário(s):** C1 — Configuração inicial
- **Ator principal:** Supervisor geral
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF09 (ver [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md))

## 2. Objetivo
Como Supervisor geral, quero parametrizar o valor do combustível e o custo por km de uma Unidade para que o sistema calcule corretamente o custo dos roteiros daquela filial.

## 3. Pré-condições e gatilho
**Pré-condições:** Unidade cadastrada (UC01). Parâmetros de custo são definidos por Unidade, pois o preço de combustível varia por região.
**Gatilho:** Supervisor geral acessa "Parametrizar custos" para uma Unidade.

## 4. Fluxo principal
1. Supervisor geral seleciona a Unidade.
2. Supervisor geral informa o valor do combustível (R$/L) e o custo por km.
3. Sistema valida que ambos os valores são maiores que zero.
4. Sistema grava os parâmetros vinculados à Unidade.
5. Sistema exibe confirmação.

## 5. Fluxos alternativos e de exceção
- **3a. Valor informado é zero ou negativo:** sistema bloqueia e informa que o valor deve ser positivo.

## 6. Pós-condições
- **Sucesso:** `Parametro.valorCombustivel` e `Parametro.custoPorKm` atualizados para a Unidade.
- **Falha:** valores anteriores mantidos.

## 7. Regras de negócio aplicadas
RF09, aplicada nos passos 2–4. Este parâmetro **não inclui** km/litro do veículo — rendimento é atributo do Entregador ([ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md)), usado por RN07 em [UC23](../C4-entregador-sai-para-fazer-entregas/UC23-calcular-distancia-e-custo-do-roteiro.md).

## 8. Dados
- **Escrita:** `Parametro` (unidadeId, valorCombustivel: decimal > 0, custoPorKm: decimal > 0).

## 9. Critérios de aceitação
- **Dado** a unidade "Filial Centro", **quando** o Supervisor geral define `valorCombustivel = R$ 6,00` e `custoPorKm = R$ 0,80`, **então** os parâmetros são gravados para essa Unidade.
- **Dado** um valor de combustível igual a `-1`, **quando** o Supervisor geral tenta salvar, **então** o sistema bloqueia e informa que o valor deve ser positivo.

## 10. Requisitos não funcionais relevantes
- Constituição, item 8 — parametrização sem alteração de código.

## 11. Questões em aberto
Nenhuma.
