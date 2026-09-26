# UC18 — Visualizar dashboard de tempo parado (dia/mês/período)

## 1. Cabeçalho
- **ID:** UC18
- **Nome:** Visualizar dashboard de tempo parado (dia/mês/período)
- **Cenário(s):** C6 — Acompanhamento e análise
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF08, RNF03

## 2. Objetivo
Como Supervisor local, quero visualizar gráficos de tempo parado por dia, mês e período para identificar gargalos na operação da minha Unidade.

## 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado; existem Roteiros finalizados na Unidade com `tempoTotalParado` calculado (UC14/UC15, cenário C4).
**Gatilho:** Supervisor local acessa a tela de dashboard.

## 4. Fluxo principal
1. Supervisor local acessa a tela de dashboard.
2. Sistema exibe, por padrão, o recorte "dia" (data corrente) com o tempo parado agregado por Entregador/Roteiro da Unidade.
3. Supervisor local seleciona o recorte desejado: dia, mês ou período (intervalo de datas).
4. Sistema consulta os Roteiros finalizados da Unidade no recorte selecionado e agrega o tempo parado.
5. Sistema exibe o gráfico correspondente, junto de um resumo numérico (total e média de tempo parado no recorte).

## 5. Fluxos alternativos e de exceção
- **3a. Recorte "período" com data final anterior à inicial:** sistema bloqueia a consulta e solicita um intervalo válido.
- **4a. Nenhum roteiro finalizado no recorte selecionado:** sistema exibe o gráfico vazio com a mensagem "Nenhum dado disponível para o período selecionado".

## 6. Pós-condições
- **Sucesso:** gráfico e resumo exibidos para o recorte selecionado.
- **Falha:** nenhum dado exibido; recorte anterior permanece na tela.

## 7. Regras de negócio aplicadas
- Nenhuma RN de negócio diretamente aplicável — o cálculo de tempo parado já foi feito por UC15 (RN01–RN03); este UC apenas agrega e exibe.

## 8. Dados
- **Leitura:** `Roteiro` (data, entregadorId, unidadeId, tempoTotalParado, status = Finalizado), filtrado por `unidadeId` do Supervisor local autenticado e pelo recorte de data.
- **Escrita:** nenhuma.

## 9. Critérios de aceitação
- **Dado** 3 roteiros finalizados hoje na Unidade Centro com tempos totais parados de 75, 40 e 60 minutos, **quando** o Supervisor local visualiza o recorte "dia", **então** o sistema exibe o gráfico com esses 3 roteiros e o total agregado de 175 minutos.
- **Dado** um recorte "período" de 01/09/2026 a 24/09/2026 sem nenhum roteiro finalizado nesse intervalo, **quando** o Supervisor local consulta, **então** o sistema exibe "Nenhum dado disponível para o período selecionado".
- **Dado** um recorte "período" com data final anterior à inicial, **quando** o Supervisor local tenta consultar, **então** o sistema bloqueia e solicita um intervalo válido.

## 10. Requisitos não funcionais relevantes
- **RNF03** — tempo de resposta do dashboard inferior a 3 segundos para consultas de até 12 meses. Atendido por agregações pré-calculadas por Roteiro (campo `tempoTotalParado` já persistido por UC15/UC14, não recalculado a cada consulta) e por índice composto em `(unidadeId, data)` na tabela de Roteiro.
- RNF02 — interface responsiva (desktop, principalmente, mas acessível em mobile).

## 11. Questões em aberto
Nenhuma — granularidade dos recortes (dia/mês/período) e estratégia de performance (RNF03) resolvidas diretamente na spec, conforme boas práticas de agregação para dashboards de MVP.
