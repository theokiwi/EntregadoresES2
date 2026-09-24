# Entregadores — Sistema de Monitoramento de Tempo Parado em Roteiros

MVP (Mínimo Produto Viável) para controle de roteiros e tempo parado de entregadores/motoristas de uma transportadora, desenvolvido como 2º Trabalho Avaliativo da disciplina Engenharia de Software II (Prof. Sandro Laudares, PUC Minas).

## Contexto e problema

Empresas de logística e entrega urbana precisam saber onde e por quanto tempo seus profissionais de campo ficam parados durante o roteiro diário. Hoje esse tempo é invisível: não há registro confiável de quanto tempo o entregador permanece em cada ponto do trajeto, o que impede identificar gargalos, renegociar prazos com clientes e calcular corretamente o custo real de cada rota.

## Objetivo do MVP

- Identificar quanto tempo o entregador/motorista fica parado em cada ponto do roteiro diário.
- Registrar e persistir pontos, roteiros e tempos coletados.
- Apresentar um painel (dashboard) com gráficos de tempo parado por dia, mês e período.
- Calcular indicadores de custo associados ao trajeto (custo por km percorrido, consumo km/litro).

## Escopo

**Dentro do escopo:** cadastro de motoristas/motoboys, gerentes/coordenadores, pontos e roteiros; coleta de chegada/saída por ponto; cálculo de tempo parado; histórico por período; dashboard; parametrização de custos e jornada padrão (8h/dia).

**Fora do escopo:** roteirização automática/otimização de rotas, integração com folha de pagamento/ERP, telemetria embarcada em tempo real, app nativo publicado em lojas.

## Regras de negócio principais

| ID | Regra |
|---|---|
| RN01 | O ponto de partida não conta tempo parado. |
| RN02 | Tempo parado no ponto = horário de saída − horário de chegada. |
| RN03 | Tempo total parado do roteiro = soma dos tempos parados, exceto o ponto de partida. |
| RN04 | Jornada padrão de 8h/dia, usada como base percentual dos indicadores. |
| RN05 | Cada roteiro pertence a um único motorista e a uma única data. |
| RN06 | Pontos possuem ordem sequencial que define o trajeto do dia. |
| RN07 | Custo do trajeto = combustível × rendimento km/litro × distância percorrida. |

Lista completa de requisitos funcionais (RF01–RF12) e não funcionais (RNF01–RNF06) na especificação de referência.

## Documentação

- [`docs/referencia/especificacao-requisitos.pdf`](docs/referencia/especificacao-requisitos.pdf) — especificação de requisitos oficial do trabalho (fonte de verdade).
- [`docs/prompt-claude-code-casos-de-uso.md`](docs/prompt-claude-code-casos-de-uso.md) — prompt de referência para geração da documentação de casos de uso, diagramas de robustez e classes (Spec Driven Development).

## Status

🚧 1ª parte — Projeto Preliminar (especificação, casos de uso, diagramas de robustez e classes) em andamento.
