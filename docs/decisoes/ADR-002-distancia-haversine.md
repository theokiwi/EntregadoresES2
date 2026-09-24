# ADR-002: Distância percorrida calculada via fórmula de Haversine

## Status
Aceita

## Contexto
RF11 exige calcular o custo estimado do roteiro a partir da distância percorrida. A especificação não define como essa distância é obtida, e RF01 não inclui leitura de odômetro do veículo.

## Decisão
A distância percorrida do roteiro é **calculada pelo sistema**, somando a distância entre pontos consecutivos a partir de latitude/longitude cadastradas em cada Ponto (RF03), usando a fórmula de Haversine. O entregador não informa odômetro nem distância manualmente.

## Consequências
- RF03 (cadastro de ponto) precisa garantir que latitude/longitude sejam obrigatórios para pontos usados em roteiros com cálculo de custo.
- Introduz um caso de uso de sistema dedicado ao cálculo (`UC23 Calcular distância e custo do roteiro`, ver [ADR-007](ADR-007-calculo-custo-roteiro-uc-dedicado.md)), incluído por `UC14 Finalizar roteiro`.
- Pontos sem coordenadas cadastradas impedem o cálculo completo da distância — comportamento exato registrado como questão em aberto na spec de UC23.
