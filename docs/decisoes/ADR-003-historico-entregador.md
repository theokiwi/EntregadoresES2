# ADR-003: Entregador só consulta o próprio histórico

## Status
Aceita

## Contexto
RF07 exige exibir histórico de pontos e tempos parados por período. RNF06 exige aderência à LGPD no tratamento de dados pessoais dos profissionais de campo. A especificação não deixa explícito se um entregador pode ver o histórico de outros.

## Decisão
O Entregador só pode consultar o **próprio** histórico (`UC22 Consultar o próprio histórico`), nunca o de outro entregador. Consulta de histórico de qualquer entregador da Unidade é privilégio de Supervisor local/geral (`UC19`).

## Consequências
- `UC22` e `UC19` são casos de uso distintos, embora ambos rastreiem RF07.
- `UC22` rastreia também RNF06 (LGPD) como justificativa da restrição.
- Toda consulta de histórico deve filtrar por identidade do ator autenticado quando o ator é Entregador.
