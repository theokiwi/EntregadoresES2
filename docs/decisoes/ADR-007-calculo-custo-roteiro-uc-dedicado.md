# ADR-007: Caso de uso de sistema dedicado ao cálculo de distância e custo (RF11/RN07)

## Status
Aceita

## Contexto
A tabela original de cenários/casos de uso tratava RF11 (calcular custo estimado) apenas como um caso de uso de consulta (`UC20 Consultar custo estimado do roteiro`), sem nenhum caso de uso responsável pelo cálculo em si. RN07 (fórmula do custo) não estava rastreada a nenhum caso de uso. Isso é assimétrico com o tratamento dado a RF06/RN02/RN03 (tempo parado), que têm `UC15 Calcular tempo parado` como caso de uso de sistema dedicado, incluído por `UC13`/`UC14`.

Adicionalmente, o escopo exato de `UC15` era ambíguo: sua rastreabilidade citava apenas RN02, embora fosse `«include»` tanto de `UC13` (cálculo por ponto) quanto de `UC14` (soma total do roteiro, RN03).

## Decisão
1. Criar `UC23 Calcular distância e custo do roteiro` (ator sistema), `«include»` de `UC14 Finalizar roteiro`, rastreado a RF11 e RN07, responsável por aplicar a fórmula de Haversine ([ADR-002](ADR-002-distancia-haversine.md)) e o cálculo de custo. `UC20` permanece exclusivamente como caso de uso de consulta ao valor já calculado.
2. Ampliar o rastreio de `UC15 Calcular tempo parado` para `RF06, RN01, RN02, RN03`, documentando explicitamente seus dois modos de disparo: por ponto (incluído por `UC13`, aplica RN01/RN02) e total do roteiro (incluído por `UC14`, aplica RN03).

## Consequências
- `UC14 Finalizar roteiro` passa a incluir dois casos de uso de sistema: `UC15` e `UC23`.
- A matriz de rastreabilidade final cobre RN07, antes ausente.
- `UC20` e `UC18`/`UC19` seguem o mesmo padrão (casos de uso de consulta, nunca de cálculo).
