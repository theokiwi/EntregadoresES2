# ADR-015: ItemRoteiro como associação entre Roteiro e Ponto

## Status
Aceita

## Contexto
`UC08` decide reaproveitar um `Ponto` já existente na base da Unidade quando o endereço se repete (ver [ADR-010](ADR-010-uc08-inclui-uc07.md)) — ou seja, `Ponto` é uma entidade **reutilizável** entre vários Roteiros (ex.: um endereço de cliente recorrente). Já as specs de UC11–UC16 (cenários C4 e C5) referenciam `Ponto.horaChegada`, `Ponto.horaSaida`, `Ponto.tempoParado`, `Ponto.status` e `Ponto.ordem` como se fossem atributos do próprio `Ponto`. Se esses campos fossem gravados diretamente em `Ponto`, um endereço reutilizado em dois Roteiros diferentes teria seus horários de chegada/saída sobrescritos a cada novo roteiro — corrompendo o histórico (RF07, RNF01).

## Decisão
Introduzir `ItemRoteiro` como entidade associativa entre `Roteiro` e `Ponto`: `id`, `roteiroId`, `pontoId`, `ordem`, `horaChegada`, `horaSaida`, `tempoParado`, `status` (enum `Pendente`|`AguardandoSaida`|`Concluido`). `Ponto` permanece somente com dados reutilizáveis e estáveis: `id`, `endereco`, `latitude`, `longitude`, `unidadeId`.

As referências a `Ponto.horaChegada` etc. nas specs de caso de uso já mescladas (UC11–UC16) são uma notação simplificada e continuam corretas no nível de caso de uso — leia-se "o `ItemRoteiro` correspondente àquele Ponto dentro do Roteiro em execução". Não é necessário reabrir essas specs; esta ADR é a referência normativa para o modelo de classes.

## Consequências
- `modelo-conceitual.puml` modela `Roteiro "1" -- "*" ItemRoteiro` e `ItemRoteiro "*" -- "1" Ponto`.
- Histórico (RF07) e auditoria (RNF05) de um Ponto reutilizado preservam corretamente os dados de cada visita, em Roteiros diferentes.
- `RN06` (ordem sequencial) passa a ser um atributo de `ItemRoteiro`, não de `Ponto`.
