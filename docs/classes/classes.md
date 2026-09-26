# Classes

Este documento explica as classes dos dois diagramas: [`modelo-conceitual.puml`](modelo-conceitual.puml) (domínio, sem métodos, ponto de partida para a seção 8 "Modelo de Dados" da especificação) e [`modelo-projeto.puml`](modelo-projeto.puml) (classes de projeto derivadas dos diagramas de robustez de cada UC, com métodos e dependências).

Duas extensões de modelagem foram necessárias para reconciliar o que as specs de casos de uso (geradas por cenário) descreviam de forma simplificada — ver [ADR-014](../decisoes/ADR-014-usuario-superclasse.md) e [ADR-015](../decisoes/ADR-015-item-roteiro-associativa.md). Nenhuma spec de UC precisou ser reaberta: as ADRs são a referência normativa para o modelo de classes.

## Modelo conceitual

| Classe | Origem | Invariantes principais |
|---|---|---|
| `Estabelecimento` | Extensão (ADR-004) | É a raiz do isolamento multi-tenant; nenhuma entidade abaixo dele é visível fora dele. |
| `Unidade` | Extensão (ADR-001) | Pertence a exatamente um `Estabelecimento`. |
| `Usuario` (abstrata) | Extensão (ADR-014) | `unidadeId` é obrigatório exceto quando `perfil = SupervisorGeral`. `senhaHash` nunca é exposto fora da camada de autenticação. |
| `Entregador` | RF01, seção 8 da especificação | `rendimentoKmLitro > 0` (RN07, ADR-005). `documento` único por `Estabelecimento`. |
| `Supervisor` | RF02, seção 8 da especificação | Perfil `SupervisorLocal` tem `unidadeId` obrigatório; `SupervisorGeral` tem `unidadeId` nulo (escopo = todo o Estabelecimento). |
| `Parametro` | RF09/RF10, seção 8 | Um por `Unidade`. `valorCombustivel > 0`, `custoPorKm > 0`, `1 ≤ jornadaPadraoHoras ≤ 24`. |
| `Ponto` | RF03, seção 8 | `latitude`/`longitude` obrigatórios (ADR-009). Reutilizável entre múltiplos Roteiros (ADR-015) — não guarda dado de uma visita específica. |
| `Roteiro` | RF04, seção 8 | Pertence a um único `Entregador` e uma única `data` (RN05). Só transiciona para `Finalizado` quando todos os `ItemRoteiro` têm `horaSaida` (ADR-011). |
| `ItemRoteiro` | Extensão (ADR-015) | `ordem` sequencial única dentro do `Roteiro` (RN06). `tempoParado` não se aplica ao item de `ordem = 1` (RN01). |
| `Auditoria` | RNF05, extensão de registro | Imutável após criada; sempre associada a um `Usuario` autor e, quando aplicável, a um `ItemRoteiro`. |

## Modelo de projeto

Camadas (ver [`arquitetura.md`](../arquitetura/arquitetura.md) para a stack completa):

- **Apresentação** — uma classe por tela (boundary dos diagramas de robustez), React. Cada tela depende apenas dos controllers que consome.
- **Aplicação** — um controller/serviço por control dos diagramas de robustez, agrupados por cenário (C1–C6) mais Autenticação. `CalculadoraTempoParado` e `CalculadoraDistanciaCusto` são serviços de sistema (sem boundary própria), reaproveitados por `RegistrarSaidaController`, `FinalizarRoteiroController` e `CorrigirHorarioController`.
- **Domínio** — mesmas classes do modelo conceitual, agora com os métodos de validação/cálculo que os controllers invocam.
- **Infraestrutura** — uma interface de repositório por agregado raiz (`Usuario`, `Unidade`, `Ponto`, `Roteiro`, `Parametro`, `Auditoria`), implementada via Prisma (ADR-008), sempre filtrando por `estabelecimento_id`.

## Rastreabilidade robustez → projeto

Todo `boundary`/`control`/`entity` que aparece nos diagramas de robustez de `docs/cenarios/*/UCxx-robustez.puml` existe correspondentemente em `modelo-projeto.puml` (telas, controllers/serviços e classes de domínio); toda `entity` existe em `modelo-conceitual.puml` (diretamente ou como a associação `ItemRoteiro`, ADR-015).
