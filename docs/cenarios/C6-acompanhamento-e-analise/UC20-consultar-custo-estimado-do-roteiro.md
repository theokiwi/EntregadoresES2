# UC20 — Consultar custo estimado do roteiro

## 1. Cabeçalho
- **ID:** UC20
- **Nome:** Consultar custo estimado do roteiro
- **Cenário(s):** C6 — Acompanhamento e análise
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Should
- **Rastreio:** RF11 (ver [ADR-007](../../decisoes/ADR-007-calculo-custo-roteiro-uc-dedicado.md) — este UC apenas consulta o valor já calculado por UC23, cenário C4; não recalcula)

## 2. Objetivo
Como Supervisor local, quero consultar o custo estimado de um roteiro finalizado para acompanhar o custo operacional da minha Unidade.

## 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado; existe ao menos um Roteiro finalizado com `custoEstimado` calculado (UC14 → UC23, cenário C4).
**Gatilho:** Supervisor local acessa a tela de detalhe de um Roteiro finalizado.

## 4. Fluxo principal
1. Supervisor local seleciona um Roteiro finalizado (via histórico, UC19, ou lista de roteiros da Unidade).
2. Sistema busca `distanciaTotal` e `custoEstimado` já gravados no Roteiro (calculados por UC23 ao finalizar).
3. Sistema exibe o custo estimado, a distância percorrida e os parâmetros usados no cálculo (combustível, rendimento km/litro do Entregador).

## 5. Fluxos alternativos e de exceção
- **1a. Roteiro selecionado ainda não finalizado:** sistema informa que o custo só está disponível após a finalização do roteiro (UC14) e não exibe valor.

## 6. Pós-condições
- **Sucesso:** custo estimado e distância exibidos.
- **Falha:** nenhum valor exibido; mensagem informativa.

## 7. Regras de negócio aplicadas
- **RN07** (aplicada por UC23 no momento do cálculo, apenas exibida aqui): custo = combustível × rendimento km/litro × distância percorrida.

## 8. Dados
- **Leitura:** `Roteiro.distanciaTotal`, `Roteiro.custoEstimado`, `Roteiro.status`; `Entregador.rendimentoKmLitro`; `Parametro.valorCombustivel` (para exibição informativa dos parâmetros usados).
- **Escrita:** nenhuma.

## 9. Critérios de aceitação
- **Dado** um roteiro finalizado com `distanciaTotal = 42 km` e `custoEstimado = R$ 21,00`, **quando** o Supervisor local consulta o custo, **então** o sistema exibe exatamente esses valores, sem recalcular.
- **Dado** um roteiro ainda em andamento (não finalizado), **quando** o Supervisor local tenta consultar seu custo, **então** o sistema informa que o custo estará disponível após a finalização.

## 10. Requisitos não funcionais relevantes
Nenhum diretamente além dos já cobertos por UC23.

## 11. Questões em aberto
Nenhuma.
