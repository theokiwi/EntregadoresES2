# UC23 — Calcular distância e custo do roteiro

## 1. Cabeçalho
- **ID:** UC23
- **Nome:** Calcular distância e custo do roteiro
- **Cenário(s):** C4 — Entregador sai para fazer entregas
- **Ator principal:** Sistema
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Should
- **Rastreio:** RF11, RN07 (ver [ADR-002](../../decisoes/ADR-002-distancia-haversine.md), [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md), [ADR-007](../../decisoes/ADR-007-calculo-custo-roteiro-uc-dedicado.md))

## 2. Objetivo
Como Sistema, quero calcular a distância total percorrida no roteiro e o custo estimado, a partir das coordenadas dos pontos, dos parâmetros de custo e do rendimento do veículo do Entregador.

## 3. Pré-condições e gatilho
**Pré-condições:** roteiro com todos os pontos com latitude/longitude cadastrados — garantido estruturalmente por [ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md), já que `UC07` exige coordenadas obrigatórias; parâmetros de custo cadastrados (UC03); rendimento km/litro do Entregador cadastrado (UC06).
**Gatilho:** inclusão por UC14 Finalizar roteiro.

## 4. Fluxo principal
1. Sistema obtém a lista ordenada de pontos do roteiro com suas coordenadas (RN06).
2. Sistema calcula a distância entre cada par de pontos consecutivos usando a fórmula de Haversine e soma os valores para obter a distância total.
3. Sistema obtém o rendimento km/litro do veículo do Entregador (UC06) e o valor do combustível parametrizado (UC03).
4. Sistema calcula o custo estimado = (distância total ÷ rendimento km/litro) × valor do combustível (RN07).
5. Sistema retorna distância total e custo estimado para UC14 gravar no roteiro.

## 5. Fluxos alternativos e de exceção
Nenhum — todo Ponto elegível para um Roteiro já possui coordenadas válidas ([ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md)), eliminando estruturalmente o caso de dado ausente.

## 6. Pós-condições
- **Sucesso:** `distanciaTotal` e `custoEstimado` calculados e retornados para UC14.
- **Falha:** cálculo não realizado; UC14 não consegue gravar os totais completos.

## 7. Regras de negócio aplicadas
- **RN06** (passo 1): pontos processados na ordem sequencial do roteiro.
- **RN07** (passo 4): custo = combustível × rendimento km/litro × distância percorrida.

## 8. Dados
- **Leitura:** `Ponto.latitude`, `Ponto.longitude`, `Ponto.ordem`; `Entregador.rendimentoKmLitro`; `Parametro.valorCombustivel`.
- **Escrita:** `Roteiro.distanciaTotal`, `Roteiro.custoEstimado` (via retorno para UC14).

## 9. Critérios de aceitação
- **Dado** um roteiro com 4 pontos com coordenadas cadastradas, cuja soma das distâncias consecutivas pela fórmula de Haversine é 42 km, **quando** o sistema calcula a distância, **então** `distanciaTotal = 42 km`.
- **Dado** rendimento do veículo = 12 km/L e valor do combustível = R$ 6,00, **quando** o sistema calcula o custo para 42 km percorridos, **então** `custoEstimado = (42 ÷ 12) × 6,00 = R$ 21,00`.

## 10. Requisitos não funcionais relevantes
Depende indiretamente de RF03 (pontos com coordenadas) e RF09 (parâmetros de custo) estarem corretamente cadastrados.

## 11. Questões em aberto
Nenhuma — resolvidas via [ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md) (coordenadas obrigatórias) e [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md)/[ADR-007](../../decisoes/ADR-007-calculo-custo-roteiro-uc-dedicado.md) ("custo por km" é indicador derivado, não fórmula alternativa).
