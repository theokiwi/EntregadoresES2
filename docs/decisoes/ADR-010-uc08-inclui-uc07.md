# ADR-010: UC08 reaproveita ou cria Pontos via inclusão condicional de UC07

## Status
Aceita

## Contexto
[ADR-006](ADR-006-pedido-sem-entidade-propria.md) já havia decidido que "Pedido" não é uma entidade própria — UC08 (Registrar pedidos/endereços de entrega) alimenta a mesma entidade `Ponto` usada por UC07 (Cadastrar ponto). Faltava definir a relação exata entre os dois casos de uso.

## Decisão
`UC08` é o ponto de entrada operacional dos endereços de entrega do dia. Para cada endereço recebido, `UC08`:
1. Busca se o endereço já existe na base de Pontos da Unidade (reuso, ex.: cliente recorrente).
2. Se existir, reaproveita o Ponto existente.
3. Se não existir, inclui `UC07 Cadastrar ponto` (`«include» condicional`) para criar um novo Ponto com aquele endereço/coordenadas.

`UC07` continua existindo como caso de uso independente para cadastro manual/antecipado de pontos na base (ex.: pontos fixos recorrentes cadastrados fora do fluxo de um pedido específico).

## Consequências
- `casos-de-uso.puml` de C3 mostra `UC08 ..> UC07 : «include»` (condicional, documentado em texto — UML não tem uma notação padrão para "include condicional"; a spec de UC08 explica a condição).
- Nenhuma entidade nova é criada; `Ponto` continua sendo a única fonte de verdade de endereços geolocalizados.
