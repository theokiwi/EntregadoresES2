# ADR-012: Perfis de acesso fixos (sem papéis customizáveis)

## Status
Aceita

## Contexto
RNF04 exige controle de acesso por perfil (motorista/motoboy, gerente/coordenador, administrador). `UC05 Gerenciar perfis de acesso` precisa de um escopo definido: criar papéis customizados (RBAC configurável) é um recurso de plataforma bem mais caro que o MVP exige.

## Decisão
Os perfis do sistema são **fixos**: Entregador, Supervisor local, Supervisor geral (mapeados 1:1 aos atores, [atores.md](../atores.md)). `UC05 Gerenciar perfis de acesso` não cria papéis novos — ele **atribui um dos três perfis fixos** a um usuário e, quando aplicável, associa esse usuário a uma Unidade (Entregador, Supervisor local) ou ao Estabelecimento como um todo (Supervisor geral).

## Consequências
- Não há tela de "criar papel"/"editar permissões de um papel" no MVP — permissões por perfil são fixas no código do back-end (checagem por enum de perfil), não configuráveis via UI.
- `UC05` é essencialmente um caso de uso de atribuição de perfil + Unidade a um usuário, executado por Supervisor geral.
- Evolução futura para RBAC configurável fica registrada como fora do escopo do MVP.
