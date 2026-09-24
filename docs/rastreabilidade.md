# Matriz de rastreabilidade

RF/RN/RNF/critério de aceitação × caso de uso × classe. Fonte: `docs/referencia/especificacao-requisitos.pdf`, seções 4, 6, 7 e 10, mais extensões registradas em [`decisoes/`](decisoes/).

## Requisitos funcionais (RF)

| ID | Descrição | Caso(s) de uso | Classe(s) |
|---|---|---|---|
| RF01 | Cadastrar motorista/motoboy | UC06 | `Entregador` ([ADR-014](decisoes/ADR-014-usuario-superclasse.md)) |
| RF02 | Cadastrar gerente/coordenador | UC02 | `Supervisor` |
| RF03 | Cadastrar pontos com endereço e coordenadas | UC07 | `Ponto` ([ADR-009](decisoes/ADR-009-coordenadas-obrigatorias.md)) |
| RF04 | Montar roteiro diário | UC09 | `Roteiro`, `ItemRoteiro` ([ADR-015](decisoes/ADR-015-item-roteiro-associativa.md)) |
| RF05 | Registrar chegada/saída em cada ponto | UC12, UC13 | `ItemRoteiro` |
| RF06 | Calcular tempo parado por ponto e total do roteiro | UC14, UC15 | `ItemRoteiro`, `Roteiro` |
| RF07 | Exibir histórico de pontos e tempos parados por período | UC19, UC22 | `Roteiro`, `ItemRoteiro`, `Ponto` |
| RF08 | Exibir dashboard de tempo parado (dia/mês/período) | UC18 | `Roteiro` |
| RF09 | Parametrizar custos | UC03 | `Parametro` |
| RF10 | Parametrizar regras de tempo parado e jornada padrão | UC04 | `Parametro` |
| RF11 | Calcular custo estimado do roteiro | UC23 (cálculo), UC20 (consulta) | `Roteiro`, `Entregador`, `Parametro` |
| RF12 | Exportar relatórios do período consultado | UC21 | — (reaproveita dados de UC18/UC19) |

## Regras de negócio (RN)

| ID | Descrição | Caso(s) de uso | Classe(s) |
|---|---|---|---|
| RN01 | Ponto de partida não conta tempo parado | UC11, UC15 | `ItemRoteiro` |
| RN02 | Tempo parado no ponto = saída − chegada | UC15 | `ItemRoteiro` |
| RN03 | Tempo total parado = soma exceto partida | UC14, UC15 | `Roteiro` |
| RN04 | Jornada padrão de 8h/dia | UC04 | `Parametro` |
| RN05 | Roteiro pertence a um único motorista e uma única data | UC09 | `Roteiro` |
| RN06 | Pontos com ordem sequencial | UC09, UC12, UC13, UC14, UC23 | `ItemRoteiro` |
| RN07 | Custo do trajeto = combustível × rendimento km/litro × distância | UC23 | `Roteiro`, `Entregador`, `Parametro` |

## Requisitos não funcionais (RNF)

| ID | Descrição | Caso(s) de uso | Classe(s) |
|---|---|---|---|
| RNF01 | Persistência com histórico completo | Todos os UCs de escrita (transversal) | Todas as entidades de `modelo-conceitual.puml` |
| RNF02 | Interface web responsiva (desktop e mobile) | Transversal — decisão de arquitetura, não um UC | — (ver [ADR-008](decisoes/ADR-008-stack-tecnologico.md)) |
| RNF03 | Dashboard responde em < 3s para até 12 meses | UC18 | `Roteiro` |
| RNF04 | Controle de acesso por perfil | UC00, UC05 | `Usuario` ([ADR-012](decisoes/ADR-012-perfis-de-acesso-fixos.md)) |
| RNF05 | Auditoria de alterações em pontos e horários | UC16, UC17 | `Auditoria` |
| RNF06 | Aderência à LGPD | UC22 (e UC00 quanto a credenciais) | `Usuario`, `Roteiro`, `ItemRoteiro` |

## Extensões ao modelo original

| Extensão | ADR | Caso(s) de uso | Classe(s) |
|---|---|---|---|
| Unidade (filial) | [ADR-001](decisoes/ADR-001-unidade.md) | UC01 | `Unidade` |
| Estabelecimento (multi-tenant) | [ADR-004](decisoes/ADR-004-multi-tenant-estabelecimento.md) | — (provisionamento fora de escopo dos UCs) | `Estabelecimento` |
| Usuario como superclasse | [ADR-014](decisoes/ADR-014-usuario-superclasse.md) | UC00, UC02, UC05, UC06 | `Usuario`, `Entregador`, `Supervisor` |
| ItemRoteiro (associação Roteiro×Ponto) | [ADR-015](decisoes/ADR-015-item-roteiro-associativa.md) | UC09, UC11–UC16 | `ItemRoteiro` |
| Perfis de acesso fixos | [ADR-012](decisoes/ADR-012-perfis-de-acesso-fixos.md) | UC05 | `Usuario` |
| Recálculo em cascata na correção | [ADR-013](decisoes/ADR-013-recalculo-em-correcao.md) | UC16 | `ItemRoteiro`, `Roteiro` |

## Critérios de aceitação da especificação (seção 10)

| Critério | Caso(s) de uso | Regra relacionada |
|---|---|---|
| Sistema não computa tempo parado no ponto de partida | UC11, UC15 | RN01 |
| Dashboard apresenta os três recortes (dia, mês, período) | UC18 | RF08 |
| Todo tempo parado exibido está vinculado a um endereço e uma data/hora | UC19, UC22 | RF07, `ItemRoteiro`+`Ponto` |
| Parâmetros de custo e de jornada alteráveis sem alteração de código | UC03, UC04 | RF09, RF10 |

## Cobertura

Todos os RF01–RF12, RN01–RN07 e RNF01–RNF06 estão ligados a pelo menos um caso de uso. Todos os UC00–UC23 têm spec própria, aparecem em um diagrama de casos de uso do seu cenário e têm diagrama de robustez. Todo elemento dos diagramas de robustez existe em `docs/classes/modelo-projeto.puml`; toda `entity` existe em `docs/classes/modelo-conceitual.puml` (ver [`classes.md`](classes/classes.md)).
