# ADR-006: "Pedido" não é uma entidade própria do modelo de dados

## Status
Aceita

## Contexto
A seção 9 (Entregáveis) da especificação cita "módulo de coleta de dados dos pontos do roteiro (entrada de pedidos) e identificação dos endereços dos pedidos para o roteiro". A seção 8 (Modelo de Dados), porém, só define a entidade `Ponto` — não existe entidade `Pedido`.

## Decisão
"Pedido" é tratado como o processo de entrada de um endereço de entrega que **produz ou associa um `Ponto`** ao Roteiro do dia, não como uma entidade de domínio separada. `UC08 Registrar pedidos/endereços de entrega` é o caso de uso que alimenta a base de `Ponto` a partir dos endereços recebidos; não introduz uma nova entidade `Pedido` no modelo conceitual.

## Consequências
- `modelo-conceitual.puml` não terá uma classe `Pedido`.
- `UC08` e `UC07 Cadastrar ponto` operam sobre a mesma entidade (`Ponto`); a relação exata entre os dois casos de uso (se `UC08` inclui `UC07` ou é um fluxo alternativo de entrada de dados) é registrada como **questão em aberto** na spec de `UC08`, a ser detalhada quando o cenário C3 for elaborado.
