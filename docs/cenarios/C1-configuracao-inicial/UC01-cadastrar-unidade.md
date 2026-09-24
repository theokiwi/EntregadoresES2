# UC01 — Cadastrar unidade

## 1. Cabeçalho
- **ID:** UC01
- **Nome:** Cadastrar unidade
- **Cenário(s):** C1 — Configuração inicial
- **Ator principal:** Supervisor geral
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** extensão (Unidade) — ver [ADR-001](../../decisoes/ADR-001-unidade.md), [ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md)

## 2. Objetivo
Como Supervisor geral, quero cadastrar uma nova Unidade (filial) no meu Estabelecimento para poder organizar equipes e roteiros por filial.

## 3. Pré-condições e gatilho
**Pré-condições:** Supervisor geral autenticado, associado a um Estabelecimento.
**Gatilho:** Supervisor geral aciona "Nova unidade" na tela de gestão de unidades.

## 4. Fluxo principal
1. Supervisor geral acessa a tela de cadastro de unidade.
2. Supervisor geral informa nome, endereço e fuso horário da Unidade (constituição, item 6 — fuso horário único por Unidade).
3. Sistema valida que o nome é único dentro do Estabelecimento.
4. Sistema grava a Unidade, associada ao `estabelecimentoId` do Supervisor geral autenticado.
5. Sistema exibe confirmação e a Unidade passa a estar disponível para cadastro de Entregadores, Pontos e Supervisores locais.

## 5. Fluxos alternativos e de exceção
- **3a. Nome de unidade já existe no mesmo Estabelecimento:** sistema bloqueia e informa o conflito.

## 6. Pós-condições
- **Sucesso:** Unidade criada e vinculada ao Estabelecimento.
- **Falha:** nenhuma Unidade criada.

## 7. Regras de negócio aplicadas
Nenhuma RN numerada diretamente — extensão registrada em ADR-001/ADR-004 aplicada nos passos 3–4 (unicidade dentro do Estabelecimento, vínculo obrigatório ao Estabelecimento).

## 8. Dados
- **Leitura:** `Estabelecimento` (id do Supervisor geral autenticado).
- **Escrita:** `Unidade` (id, nome, endereço, fusoHorario, estabelecimentoId).

## 9. Critérios de aceitação
- **Dado** o Supervisor geral do Estabelecimento "Transportes Rápido", **quando** ele cadastra a unidade "Filial Centro", **então** a Unidade é criada vinculada ao Estabelecimento "Transportes Rápido".
- **Dado** que já existe uma unidade "Filial Centro" no mesmo Estabelecimento, **quando** o Supervisor geral tenta cadastrar outra unidade com o mesmo nome, **então** o sistema bloqueia e informa o conflito.

## 10. Requisitos não funcionais relevantes
- RNF04 — apenas Supervisor geral executa este caso de uso.

## 11. Questões em aberto
Nenhuma.
