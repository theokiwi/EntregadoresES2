# ADR-011: Finalização do roteiro exige todos os pontos concluídos, sem exceção

## Status
Aceita

## Contexto
A spec original de `UC14 Finalizar roteiro` deixava em aberto se seria possível finalizar um roteiro com pontos pendentes, propondo um fluxo alternativo de "confirmação explícita". Esse estado intermediário complica o cálculo de tempo total parado (RN03) e de custo (RN07) — um roteiro parcialmente concluído produziria indicadores incompletos e potencialmente enganosos no dashboard (RF08).

## Decisão
`UC14` só pode ser executado quando **todos** os pontos do roteiro têm saída registrada (RN06). Não há finalização parcial nem confirmação explícita para pular pontos pendentes. Se o Entregador não concluir o roteiro no dia, o roteiro permanece "Em andamento" — retomar/cancelar um roteiro em aberto em outro dia fica registrado como **fora do escopo do MVP** (mesma linha da especificação, que já exclui roteirização automática e reotimização de rotas).

## Consequências
- `UC14` fica mais simples: um único fluxo alternativo (`1a. pontos pendentes → sistema bloqueia e informa quais pontos faltam`), sem estado "finalizado com pendência".
- Indicadores de dashboard e custo sempre refletem roteiros completos.
- Cancelamento/retomada de roteiro incompleto é registrado como questão em aberto de produto (não de especificação), fora do escopo desta documentação.
