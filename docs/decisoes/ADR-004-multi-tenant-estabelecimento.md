# ADR-004: Multi-tenant — Estabelecimento contém Unidades

## Status
Aceita

## Contexto
Requisito extra do cliente (não constante na especificação de requisitos original): o sistema precisa ser multi-tenant, pois atenderá diferentes estabelecimentos (transportadoras/clientes) na mesma plataforma. Já existia a extensão **Unidade** ([ADR-001](ADR-001-unidade.md)), modelando filiais de uma única transportadora.

## Decisão
Introduzir a entidade **Estabelecimento** como o nível de isolamento multi-tenant (tenant), acima de Unidade:

```
Estabelecimento (tenant)
└── Unidade (filial) 1..N
    └── Entregadores, Pontos, Roteiros, Supervisor local
```

- Supervisor geral atua sobre todas as Unidades do **seu** Estabelecimento — nunca de outro.
- Nenhum dado (Entregador, Ponto, Roteiro, Parâmetro, Auditoria) é acessível fora do Estabelecimento ao qual pertence.
- Estratégia de isolamento de dados: banco de dados compartilhado com coluna discriminadora `estabelecimento_id` em toda entidade operacional, aplicada obrigatoriamente em toda consulta pela camada de aplicação (ver [ADR-008](ADR-008-stack-tecnologico.md)). Escolhida em vez de schema-por-tenant ou banco-por-tenant por simplicidade operacional, adequada ao escopo de MVP.

## Consequências
- `UC01 Cadastrar unidade` passa a criar uma Unidade dentro do Estabelecimento do Supervisor geral autenticado, não um Estabelecimento novo.
- A criação de um Estabelecimento (onboarding de um novo tenant) não é modelada como caso de uso do sistema neste MVP — fica registrada como **questão em aberto**: assume-se provisionamento operacional pela equipe do produto (ex. via script/admin interno), fora do escopo dos atores Entregador/Supervisor.
- Todo princípio de isolamento por Unidade ([ADR-001](ADR-001-unidade.md)) passa a ser um sub-caso do isolamento por Estabelecimento (ver [constituição](../constituicao.md), itens 1 e 2).
- Autenticação (`UC00`) precisa resolver o Estabelecimento do usuário antes de resolver sua Unidade e perfil.
