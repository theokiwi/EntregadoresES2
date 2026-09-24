# ADR-001: Introdução do conceito de Unidade

## Status
Aceita

## Contexto
A especificação de requisitos não modela filiais/unidades operacionais: entregadores, pontos, roteiros e gerentes/coordenadores aparecem como se pertencessem a uma única organização plana. Na prática, uma transportadora opera múltiplas filiais, cada uma com sua própria equipe de entregadores, base de pontos e supervisor.

## Decisão
Introduzir a entidade **Unidade** (filial), não presente no modelo de dados original. Entregadores, Pontos, Roteiros e Supervisores locais pertencem a uma Unidade. Supervisor local atua sobre uma única Unidade; Supervisor geral herda Supervisor local (generalização de atores) e tem visão consolidada de todas as Unidades.

## Consequências
- Todo cadastro de Entregador, Ponto e Roteiro passa a exigir associação a uma Unidade.
- Necessário um novo caso de uso `UC01 Cadastrar unidade`.
- Isolamento de dados por Unidade se torna princípio transversal (ver [constituição](../constituicao.md), item 2).
- Posteriormente refinada por [ADR-004](ADR-004-multi-tenant-estabelecimento.md): Unidade passa a ser subordinada a um Estabelecimento (tenant multi-tenant).
