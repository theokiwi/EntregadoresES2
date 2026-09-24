# Glossário

| Termo | Definição |
|---|---|
| **Estabelecimento** | Tenant do sistema: uma transportadora/cliente da plataforma. Isola completamente seus dados de outros Estabelecimentos (multi-tenant). Extensão registrada em [ADR-004](decisoes/ADR-004-multi-tenant-estabelecimento.md). |
| **Unidade** | Filial de um Estabelecimento. Entregadores, Pontos, Roteiros e Supervisores locais pertencem a uma Unidade. Extensão registrada em [ADR-001](decisoes/ADR-001-unidade.md). |
| **Entregador** | Ator que executa o roteiro em campo; corresponde a motorista/motoboy da especificação original. |
| **Supervisor local** | Ator que gerencia uma única Unidade (corresponde a gerente/coordenador da especificação). |
| **Supervisor geral** | Ator que gerencia todas as Unidades do seu Estabelecimento (corresponde a administrador/dono da especificação); herda as permissões de Supervisor local (generalização de atores). |
| **Ponto** | Endereço geolocalizado (latitude/longitude) que faz parte de um Roteiro, com horário de chegada, horário de saída e tempo parado calculado. |
| **Roteiro** | Conjunto ordenado de Pontos, associado a um único Entregador e uma única data (RN05, RN06). |
| **Ponto de partida** | Primeiro Ponto do Roteiro (ordem 1). Não acumula tempo parado (RN01). |
| **Tempo parado** | Diferença entre horário de saída e horário de chegada em um Ponto (RN02), exceto no ponto de partida. |
| **Tempo total parado** | Soma do tempo parado de todos os Pontos de um Roteiro, exceto o de partida (RN03). |
| **Distância percorrida** | Soma das distâncias entre Pontos consecutivos do Roteiro, calculada pelo sistema via fórmula de Haversine a partir de latitude/longitude. Ver [ADR-002](decisoes/ADR-002-distancia-haversine.md). |
| **Custo estimado** | Custo do Roteiro calculado a partir do valor do combustível, do rendimento km/litro do veículo do Entregador e da distância percorrida (RN07). |
| **Jornada padrão** | Referência de 8 horas por dia usada como base percentual dos indicadores de tempo parado (RN04). |
| **Parâmetro** | Conjunto de configurações de custo e regras de cálculo (valor do combustível, custo/km, jornada padrão), editável sem alteração de código (RF09, RF10). |
| **Auditoria** | Registro imutável de alterações manuais em horários de chegada/saída, com autor, data/hora e valores antes/depois (RNF05). |
| **Pedido** | Não é uma entidade própria do modelo de dados. É a forma como um endereço de entrega chega ao sistema antes de virar um Ponto do Roteiro. Ver [ADR-006](decisoes/ADR-006-pedido-sem-entidade-propria.md). |
| **Perfil de acesso** | Conjunto de permissões associado a um ator (Entregador, Supervisor local, Supervisor geral) que define quais casos de uso ele pode executar (RNF04). |
