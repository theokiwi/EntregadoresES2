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
**Pré-condições:** roteiro com todos os pontos com latitude/longitude cadastrados (RF03); parâmetros de custo cadastrados (UC03); rendimento km/litro do Entregador cadastrado (UC06).
**Gatilho:** inclusão por UC14 Finalizar roteiro.

## 4. Fluxo principal
1. Sistema obtém a lista ordenada de pontos do roteiro com suas coordenadas (RN06).
2. Sistema calcula a distância entre cada par de pontos consecutivos usando a fórmula de Haversine e soma os valores para obter a distância total.
3. Sistema obtém o rendimento km/litro do veículo do Entregador (UC06) e o valor do combustível parametrizado (UC03).
4. Sistema calcula o custo estimado = (distância total ÷ rendimento km/litro) × valor do combustível (RN07).
5. Sistema retorna distância total e custo estimado para UC14 gravar no roteiro.

## 5. Fluxos alternativos e de exceção
- **1a. Algum ponto do roteiro não possui latitude/longitude cadastrados:** sistema não consegue calcular a distância para o trecho envolvendo aquele ponto; roteiro é finalizado com indicador de dado incompleto (comportamento exato registrado em Questões em aberto).

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
- **Dado** um ponto do roteiro sem latitude/longitude cadastrados, **quando** o sistema tenta calcular a distância, **então** o cálculo não é concluído e o sistema sinaliza dado incompleto no roteiro.

## 10. Requisitos não funcionais relevantes
Depende indiretamente de RF03 (pontos com coordenadas) e RF09 (parâmetros de custo) estarem corretamente cadastrados.

## 11. Questões em aberto
- A especificação não define o comportamento quando faltam coordenadas em algum ponto (bloquear a finalização do roteiro? calcular parcialmente? tratar o trecho como distância zero?). Registrado para validação com o cliente.
- A especificação não deixa claro se o "custo por km" parametrizado em RF09 é uma fórmula alternativa de cálculo do custo do roteiro ou um indicador auxiliar exibido no dashboard. Assumido, conforme ADR-005 e ADR-007, que RN07 (combustível × rendimento × distância) é a fórmula oficial do custo do roteiro, e "custo por km" é um indicador derivado exibido separadamente.
