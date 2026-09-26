# Custos operacionais e precificação do RotaÁgil

Estimativa para uma operação SaaS pequena no Brasil, em reais, com valores de referência de setembro de 2026. Os números devem ser revisados antes de uma operação comercial real, pois câmbio, impostos, tráfego e fornecedores variam.

## Premissas

- 100 empresas clientes, média de 15 usuários e 3.000 consultas de endereço por mês por empresa.
- Aplicação web React, API NestJS e PostgreSQL gerenciado.
- 30 dias por mês, backups diários e ambiente de produção com monitoramento básico.
- Os custos abaixo não incluem salários, comissão comercial nem tributos. Para planejamento conservador, foi adicionada uma reserva operacional de 10%.

## Custos mensais estimados

| Item | Natureza | Mensal (R$) | Critério |
|---|---:|---:|---|
| Hospedagem da API | Fixo | 250,00 | 2 instâncias pequenas para disponibilidade |
| Frontend/CDN | Fixo | 100,00 | hospedagem estática, tráfego e cache |
| PostgreSQL gerenciado | Fixo | 350,00 | banco, armazenamento e backups |
| Logs e monitoramento | Fixo | 120,00 | alertas, retenção e rastreamento de erros |
| E-mail transacional | Fixo | 60,00 | convites e notificações |
| Domínio, DNS e certificados | Fixo | 20,00 | média mensal anualizada |
| Geoapify/geocodificação | Variável | 300,00 | franquia/plano para cerca de 300 mil consultas |
| Armazenamento e saída de dados | Variável | 100,00 | relatórios, backups adicionais e tráfego |
| **Subtotal técnico** |  | **1.300,00** |  |
| Reserva operacional (10%) |  | **130,00** | variação de consumo e câmbio |
| **Custo mensal estimado** |  | **1.430,00** | **R$ 14,30 por empresa com 100 clientes** |

O OpenStreetMap/Leaflet não cobra licença no arranjo atual. Em produção, os termos do provedor de tiles devem ser respeitados; tráfego relevante deve usar um serviço comercial ou infraestrutura própria. O gateway de pagamento não integra o MVP. Quando real, deve-se adicionar aproximadamente 3% a 5% por transação ao custo variável.

## Preço necessário por margem bruta

A fórmula usada é `preço = custo unitário / (1 - margem)`. Com custo técnico médio de R$ 14,30 por cliente/mês:

| Margem bruta desejada | Preço médio mínimo por cliente |
|---:|---:|
| 30% | R$ 20,43 |
| 50% | R$ 28,60 |
| 60% | R$ 35,75 |
| 70% | R$ 47,67 |
| 80% | R$ 71,50 |
| 85% | R$ 95,33 |
| 90% | R$ 143,00 |

Essas margens são técnicas: ainda precisam financiar equipe, suporte, vendas, impostos, inadimplência e evolução do produto. Por isso os planos do MVP ficam acima do ponto de equilíbrio técnico.

## Planos propostos

| Plano | Limites | Mensalidade | Custo técnico alocado estimado* | Margem bruta técnica |
|---|---|---:|---:|---:|
| Essencial | 5 entregadores, 1 unidade | R$ 149,00 | R$ 11,00 | 92,6% |
| Profissional | 20 entregadores, 3 unidades | R$ 299,00 | R$ 18,00 | 94,0% |
| Escala | 60 entregadores, 10 unidades | R$ 599,00 | R$ 38,00 | 93,7% |

\*Rateio aproximado ponderado pelo maior uso de banco, geocodificação, e-mail e suporte. Não inclui pessoas e tributos.

### Sensibilidade de escala

| Clientes ativos | Custo fixo + variável estimado | Custo médio por cliente | Receita se ticket médio = R$ 299 | Margem técnica aproximada |
|---:|---:|---:|---:|---:|
| 25 | R$ 1.100 | R$ 44,00 | R$ 7.475 | 85,3% |
| 50 | R$ 1.200 | R$ 24,00 | R$ 14.950 | 92,0% |
| 100 | R$ 1.430 | R$ 14,30 | R$ 29.900 | 95,2% |
| 500 | R$ 4.500 | R$ 9,00 | R$ 149.500 | 97,0% |

Antes do lançamento comercial, recomenda-se substituir as estimativas por cotações dos fornecedores escolhidos e montar um DRE incluindo folha, aquisição de clientes, suporte, impostos e taxas do gateway.
