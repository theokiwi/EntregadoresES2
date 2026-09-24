# C1 — Configuração inicial

## Objetivo do cenário
Cobrir a configuração inicial de um Estabelecimento por seu Supervisor geral: estruturar Unidades (filiais), delegar a gestão local a Supervisores locais, parametrizar custos e jornada, e definir perfis de acesso — tudo isolado ao próprio Estabelecimento (multi-tenant).

## Atores
- **Supervisor geral** — ator principal de todos os UCs deste cenário.
- **Supervisor local** — introduzido aqui por generalização de atores (herda os casos de uso de Supervisor local; ver diagrama).

## Casos de uso do cenário
| UC | Nome | Rastreio |
|---|---|---|
| UC01 | Cadastrar unidade | extensão (Unidade) |
| UC02 | Cadastrar supervisor local | RF02 |
| UC03 | Parametrizar custos (combustível, custo/km) | RF09 |
| UC04 | Parametrizar jornada e regras de tempo parado | RF10, RN04 |
| UC05 | Gerenciar perfis de acesso | RNF04 |

## Pré-condições gerais do cenário
- Supervisor geral autenticado (UC00), associado a um Estabelecimento já existente (provisionamento de Estabelecimento é operacional, fora do escopo — [ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md)).

## Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml). Mostra a generalização de atores Supervisor geral → Supervisor local, introduzida neste cenário.

## Decisões aplicadas neste cenário
- [ADR-001](../../decisoes/ADR-001-unidade.md) — conceito de Unidade.
- [ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md) — Unidade pertence a um Estabelecimento; isolamento multi-tenant.
- [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md) — UC03 não parametriza km/litro (é atributo do Entregador, cadastrado em UC06/C2).
- [ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md) — UC05 atribui um dos três perfis fixos, não cria papéis customizados.
