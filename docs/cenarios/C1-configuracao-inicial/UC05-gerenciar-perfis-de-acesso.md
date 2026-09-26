# UC05 — Gerenciar perfis de acesso

## 1. Cabeçalho
- **ID:** UC05
- **Nome:** Gerenciar perfis de acesso
- **Cenário(s):** C1 — Configuração inicial
- **Ator principal:** Supervisor geral
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RNF04 (ver [ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md))

## 2. Objetivo
Como Supervisor geral, quero atribuir ou alterar o perfil de acesso e a Unidade de um usuário para manter o controle de quem pode fazer o quê no sistema.

## 3. Pré-condições e gatilho
**Pré-condições:** usuário já cadastrado (via UC02 Cadastrar supervisor local ou UC06 Cadastrar entregador).
**Gatilho:** Supervisor geral busca um usuário na tela de gestão de perfis e aciona "Editar perfil".

## 4. Fluxo principal
1. Supervisor geral busca o usuário pelo nome ou e-mail.
2. Sistema exibe o perfil atual (Entregador, Supervisor local ou Supervisor geral) e a Unidade vinculada.
3. Supervisor geral seleciona um dos três perfis fixos ([ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md)) e/ou uma nova Unidade.
4. Sistema valida que a Unidade selecionada pertence ao mesmo Estabelecimento do Supervisor geral.
5. Sistema grava a alteração e registra um evento de auditoria (autor, data/hora, perfil/Unidade antigos e novos).
6. Sistema exibe confirmação.

## 5. Fluxos alternativos e de exceção
- **4a. Unidade selecionada pertence a outro Estabelecimento:** sistema bloqueia (nunca listada como opção, por isolamento multi-tenant — [ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md)).

## 6. Pós-condições
- **Sucesso:** perfil e/ou Unidade do usuário atualizados; registro de auditoria criado.
- **Falha:** nenhuma alteração.

## 7. Regras de negócio aplicadas
RNF04, aplicada nos passos 3–4 (perfis fixos, escopo por Unidade/Estabelecimento).

## 8. Dados
- **Leitura:** `Supervisor`/`Entregador` (usuário-alvo), `Unidade` (opções do Estabelecimento).
- **Escrita:** `Supervisor`/`Entregador`.perfil, `.unidadeId`; `Auditoria` (autor, timestamp, valores antigo/novo).

## 9. Critérios de aceitação
- **Dado** a usuária Maria com perfil Entregador na Unidade "Filial Centro", **quando** o Supervisor geral a promove a Supervisor local da mesma Unidade, **então** o perfil é atualizado e um registro de auditoria é criado.
- **Dado** uma tentativa de vincular um usuário a uma Unidade de outro Estabelecimento, **quando** o Supervisor geral confirma, **então** o sistema bloqueia a operação.

## 10. Requisitos não funcionais relevantes
- RNF04 — controle de acesso por perfil.
- RNF05 — toda alteração de perfil/Unidade é auditada.

## 11. Questões em aberto
Nenhuma.
