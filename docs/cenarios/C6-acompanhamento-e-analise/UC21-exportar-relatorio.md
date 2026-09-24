# UC21 — Exportar relatório

## 1. Cabeçalho
- **ID:** UC21
- **Nome:** Exportar relatório
- **Cenário(s):** C6 — Acompanhamento e análise
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Could
- **Rastreio:** RF12 — `«extend»` de UC18 (dashboard) e UC19 (histórico)

## 2. Objetivo
Como Supervisor local, quero exportar os dados que estou visualizando no dashboard ou no histórico, para analisá-los fora do sistema.

## 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local está com uma consulta de UC18 ou UC19 aberta, com um recorte/período já definido.
**Gatilho:** Supervisor local aciona "Exportar" na tela de dashboard (UC18) ou de histórico (UC19).

## 4. Fluxo principal
1. Supervisor local aciona "Exportar" a partir da tela de UC18 ou UC19.
2. Sistema gera um arquivo **CSV** com os dados atualmente filtrados (mesmo recorte/período/filtro da consulta em tela). Formato CSV escolhido por ser simples de gerar e consumir (Excel/planilhas), sem exigir biblioteca de geração de PDF no MVP.
3. Sistema disponibiliza o arquivo para download.

## 5. Fluxos alternativos e de exceção
- **2a. Consulta de origem sem nenhum dado (lista vazia):** sistema informa que não há dados para exportar e não gera arquivo.

## 6. Pós-condições
- **Sucesso:** arquivo CSV disponibilizado para download com os dados do recorte/período/filtro vigente.
- **Falha:** nenhum arquivo gerado.

## 7. Regras de negócio aplicadas
Nenhuma — reaproveita os dados já filtrados/calculados por UC18 ou UC19.

## 8. Dados
- **Leitura:** os mesmos dados já lidos pelo caso de uso estendido (UC18: agregados de tempo parado; UC19: pontos/tempos/endereços).
- **Escrita:** nenhuma persistente — gera um arquivo de saída (CSV) para download.

## 9. Critérios de aceitação
- **Dado** uma consulta de histórico (UC19) filtrada por setembro/2026 com 5 roteiros, **quando** o Supervisor local exporta, **então** o sistema gera um CSV com as 5 linhas de roteiro (e seus pontos) correspondentes ao filtro.
- **Dado** uma consulta de dashboard (UC18) sem nenhum roteiro no recorte selecionado, **quando** o Supervisor local tenta exportar, **então** o sistema informa que não há dados para exportar.

## 10. Requisitos não funcionais relevantes
- RNF01 — dados exportados refletem o que está persistido no histórico.

## 11. Questões em aberto
Nenhuma — formato (CSV) e escopo (mesmo filtro da tela de origem) decididos nesta spec como escolha de MVP enxuto; evolução para PDF/outros formatos fica para fora do MVP.
