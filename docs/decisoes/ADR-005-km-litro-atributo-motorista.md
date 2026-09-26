# ADR-005: Rendimento km/litro é atributo do Entregador/veículo, não parâmetro global

## Status
Aceita

## Contexto
A especificação cita "km/litro do veículo" em dois lugares com sentidos aparentemente conflitantes:
- RF01 e a entidade `Motorista/Motoboy` (seção 8): rendimento km/litro como atributo por entregador/veículo.
- RF09 e a entidade `Parâmetro` (seção 8): km/litro do veículo como parâmetro de custo geral.

RN07 ("custo do trajeto é calculado a partir do valor do combustível, **do rendimento km/litro do veículo** e da distância percorrida") usa a expressão "do veículo", reforçando a leitura de atributo por entregador.

## Decisão
Rendimento km/litro é modelado **apenas** como atributo do Entregador/veículo (`UC06 Cadastrar entregador`), nunca como parâmetro global compartilhado. `UC03 Parametrizar custos` cobre apenas valor do combustível e custo por km. O campo "km/litro do veículo" citado em RF09/entidade `Parâmetro` é considerado redundante na especificação original e não é implementado como parâmetro separado.

## Consequências
- `UC20`/`UC23` usam o rendimento km/litro do Entregador dono do roteiro, não um valor de configuração global.
- Se dois entregadores tiverem veículos com rendimentos diferentes, o custo do roteiro reflete corretamente o veículo usado.
