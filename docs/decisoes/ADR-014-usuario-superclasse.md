# ADR-014: Usuario como superclasse de Entregador e Supervisor

## Status
Aceita

## Contexto
Os cenários foram gerados em paralelo por pacote (C1–C6, Transversal). Isso produziu uma inconsistência entre eles: `UC00 Autenticar-se` (Transversal) modela as credenciais em uma entidade `Usuario` (id, email, senhaHash, perfil, estabelecimentoId, unidadeId, ativo); já `UC02` e `UC06` modelam `Supervisor` e `Entregador` como entidades próprias, cada uma repetindo campos de identidade/perfil/escopo (email, perfil, unidadeId, estabelecimentoId, status). Ao consolidar o modelo de classes, essa duplicação precisa ser resolvida — do contrário haveria duas fontes de verdade para a mesma credencial.

## Decisão
`Usuario` é a superclasse (generalização) que concentra autenticação e escopo multi-tenant: `id`, `email`, `senhaHash`, `perfil` (enum `Entregador`|`SupervisorLocal`|`SupervisorGeral`), `estabelecimentoId`, `unidadeId` (nulo somente quando `perfil = SupervisorGeral`), `ativo`.

`Entregador` e `Supervisor` **herdam** de `Usuario` e acrescentam apenas os atributos de negócio específicos:
- `Entregador`: `nome`, `telefone`, `documento`, `veiculo`, `rendimentoKmLitro`.
- `Supervisor`: `nome`, `telefone`.

`Supervisor` não se divide em duas classes para local/geral — o `perfil` herdado de `Usuario` já discrimina isso, e `unidadeId` nulo indica escopo de Estabelecimento inteiro (Supervisor geral). Essa é uma modelagem de **classes de domínio**, diferente da **generalização de atores** (Supervisor geral → Supervisor local) já usada nos diagramas de casos de uso ([atores.md](../atores.md)) — ambas descrevem a mesma hierarquia de permissões, em níveis de abstração diferentes (ator vs. classe), e não precisam ter a mesma forma.

## Consequências
- `modelo-conceitual.puml` mostra `Usuario` como superclasse abstrata, com `Entregador` e `Supervisor` como subclasses.
- As specs de UC02, UC05, UC06 e UC00 (já mescladas em `develop`) usam uma notação simplificada (campos repetidos em vez de herança explícita); esta ADR é a referência normativa para o modelo de classes — não é necessário reabrir/editar essas specs, que continuam corretas no nível de caso de uso.
- Toda consulta de autorização (perfil, unidade, estabelecimento) é feita a partir de `Usuario`, nunca duplicada em `Entregador`/`Supervisor`.
