# UC02 — Cadastrar supervisor local

## 1. Cabeçalho
- **ID:** UC02
- **Nome:** Cadastrar supervisor local
- **Cenário(s):** C1 — Configuração inicial
- **Ator principal:** Supervisor geral
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF02

## 2. Objetivo
Como Supervisor geral, quero cadastrar um Supervisor local vinculado a uma Unidade para delegar a gestão do dia a dia daquela filial.

## 3. Pré-condições e gatilho
**Pré-condições:** pelo menos uma Unidade cadastrada no Estabelecimento (UC01).
**Gatilho:** Supervisor geral aciona "Novo supervisor local".

## 4. Fluxo principal
1. Supervisor geral acessa a tela de cadastro de supervisor.
2. Supervisor geral informa nome, telefone, e-mail e seleciona a Unidade (dentre as do próprio Estabelecimento).
3. Sistema valida que o e-mail é único dentro do Estabelecimento.
4. Sistema cria o usuário com perfil "Supervisor local" ([ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md)), vinculado à Unidade selecionada.
5. Sistema envia um convite por e-mail com link para definição de senha; usuário fica com status "Convite pendente" até o primeiro acesso.

## 5. Fluxos alternativos e de exceção
- **3a. E-mail já cadastrado no Estabelecimento:** sistema bloqueia e informa o conflito.

## 6. Pós-condições
- **Sucesso:** usuário Supervisor local criado, vinculado à Unidade e ao Estabelecimento, status "Convite pendente".
- **Falha:** nenhum usuário criado.

## 7. Regras de negócio aplicadas
RF02, aplicada nos passos 2–4 (cadastro do gerente/coordenador). Isolamento por Estabelecimento ([ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md)) aplicado no passo 2 (só Unidades do próprio Estabelecimento aparecem para seleção).

## 8. Dados
- **Leitura:** `Unidade` (lista das Unidades do Estabelecimento).
- **Escrita:** `Supervisor` (id, nome, telefone, email, perfil=SupervisorLocal, unidadeId, estabelecimentoId, status).

## 9. Critérios de aceitação
- **Dado** a unidade "Filial Centro" cadastrada, **quando** o Supervisor geral cadastra João (joao@empresa.com) vinculado a essa unidade, **então** o sistema cria o usuário com perfil Supervisor local, status "Convite pendente", e envia o convite por e-mail.
- **Dado** que joao@empresa.com já está cadastrado no Estabelecimento, **quando** o Supervisor geral tenta cadastrá-lo novamente, **então** o sistema bloqueia e informa o conflito.

## 10. Requisitos não funcionais relevantes
- RNF04 — apenas Supervisor geral executa este caso de uso.
- RNF06 — apenas os dados pessoais necessários (nome, telefone, e-mail) são coletados.

## 11. Questões em aberto
Nenhuma. Decisão de implementação: convite por e-mail com definição de senha própria (sem transmitir senha em texto), abordagem padrão de mercado para provisionamento de usuário.
