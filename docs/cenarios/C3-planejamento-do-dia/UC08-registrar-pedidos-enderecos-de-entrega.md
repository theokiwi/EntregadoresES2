# UC08 — Registrar pedidos/endereços de entrega

## 1. Cabeçalho
- **ID:** UC08
- **Nome:** Registrar pedidos/endereços de entrega
- **Cenário(s):** C3 — Planejamento do dia
- **Ator principal:** Supervisor local
- **Atores secundários:** Sistema (via `«include»` condicional de UC07)
- **Prioridade (MoSCoW):** Must
- **Rastreio:** Entregáveis (seção 9 da especificação, sem RF direto) — ver [ADR-006](../../decisoes/ADR-006-pedido-sem-entidade-propria.md) e [ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md)

## 2. Objetivo
Como Supervisor local, quero registrar os endereços de entrega recebidos no dia para alimentar a base de pontos usada na montagem do roteiro.

## 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado, associado a uma Unidade.
**Gatilho:** Chegada de um novo pedido/endereço de entrega a ser atendido.

## 4. Fluxo principal
1. Supervisor local acessa a tela de registro de endereços de entrega.
2. Supervisor local informa o endereço do pedido.
3. Sistema busca, na base de Pontos da Unidade, um Ponto com endereço correspondente.
4. Sistema encontra um Ponto existente e o reaproveita, disponibilizando-o para seleção em `UC09`.
5. Sistema confirma o registro do endereço.

## 5. Fluxos alternativos e de exceção
- **3a. Endereço não encontrado na base:** sistema inclui **UC07 Cadastrar ponto** (`«include»` condicional, [ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md)) para criar um novo Ponto com aquele endereço e coordenadas (RF03); ao concluir, o novo Ponto fica disponível para seleção em `UC09`, como no fluxo principal.
- **2a. Endereço informado incompleto ou inválido (ex.: sem número):** sistema bloqueia o registro e solicita a correção antes de prosseguir.

## 6. Pós-condições
- **Sucesso:** Ponto correspondente ao endereço existe na base da Unidade e está disponível para seleção em `UC09`.
- **Falha:** nenhuma alteração.

## 7. Regras de negócio aplicadas
Nenhuma RN da especificação se aplica diretamente a este caso de uso. A relação com `UC07` é regida por [ADR-006](../../decisoes/ADR-006-pedido-sem-entidade-propria.md) e [ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md).

## 8. Dados
- **Leitura:** `Ponto` (busca por endereço dentro da `unidadeId`).
- **Escrita:** `Ponto` (criação, via inclusão de `UC07`, apenas quando não encontrado).

## 9. Critérios de aceitação
- **Dado** que o endereço "Rua Peru, 55" já existe como Ponto cadastrado na Unidade Centro, **quando** o Supervisor local registra um pedido para esse endereço, **então** o sistema reaproveita o Ponto existente sem duplicar o cadastro.
- **Dado** que o endereço "Av. Nova, 200" ainda não existe na base de Pontos da Unidade, **quando** o Supervisor local registra um pedido para esse endereço, **então** o sistema inclui `UC07` e cria um novo Ponto com esse endereço e coordenadas antes de disponibilizá-lo.
- **Dado** um endereço informado sem número, **quando** o Supervisor local tenta registrar o pedido, **então** o sistema bloqueia o registro e solicita a correção do endereço.

## 10. Requisitos não funcionais relevantes
- RNF01 — persistência com histórico completo da base de pontos.

## 11. Questões em aberto
Nenhuma pendente de validação com o cliente — resolvidas via ADR-006 e ADR-010. Observação de escopo: dados específicos de um pedido externo (ex.: número do pedido, nome do cliente) não constam no modelo de dados da especificação (seção 8); se necessários no futuro, exigiriam uma extensão do modelo (nova entidade `Pedido` ou campos adicionais em `Ponto`), fora do escopo deste MVP.
