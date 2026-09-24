# Constituição

Princípios transversais que valem para toda spec de caso de uso, diagrama e decisão de arquitetura deste projeto. Derivados dos requisitos não funcionais (RNF01–RNF06) da especificação e das extensões registradas em `decisoes/`.

1. **Isolamento multi-tenant por Estabelecimento.** Nenhum dado (entregador, ponto, roteiro, parâmetro, auditoria) é visível ou acessível a partir de um Estabelecimento diferente daquele ao qual pertence. É a fronteira de isolamento mais externa do sistema. Ver [ADR-004](decisoes/ADR-004-multi-tenant-estabelecimento.md).

2. **Isolamento por Unidade dentro do Estabelecimento.** Supervisor local só opera dados da própria Unidade (filial); Supervisor geral tem visão consolidada de todas as Unidades do seu Estabelecimento — nunca de outro Estabelecimento. Ver [ADR-001](decisoes/ADR-001-unidade.md) e [ADR-004](decisoes/ADR-004-multi-tenant-estabelecimento.md).

3. **Controle de acesso por perfil.** Cada ator (Entregador, Supervisor local, Supervisor geral) só executa os casos de uso permitidos ao seu perfil (RNF04, UC05).

4. **Auditoria obrigatória de alterações em registros de tempo.** Toda alteração manual em horário de chegada/saída gera registro de auditoria imutável, com autor, data/hora, valor anterior e novo valor (RNF05, UC16, UC17).

5. **Minimização de dados pessoais / LGPD.** Coleta-se apenas os dados pessoais necessários à operação; o Entregador acessa somente o próprio histórico (RNF06). Ver [ADR-003](decisoes/ADR-003-historico-entregador.md).

6. **Fuso horário único por Unidade.** Todos os registros de data/hora (chegada, saída, roteiro) são armazenados e comparados num único fuso horário de referência da Unidade, evitando erros de cálculo de tempo parado.

7. **Cálculos derivados nunca são informados manualmente.** Tempo parado (RN02/RN03) e distância percorrida (RN07, Haversine) são sempre calculados pelo sistema, nunca digitados pelo ator. Ver [ADR-002](decisoes/ADR-002-distancia-haversine.md) e [ADR-007](decisoes/ADR-007-calculo-custo-roteiro-uc-dedicado.md).

8. **Parametrização sem alteração de código.** Custos, jornada padrão e regras de cálculo de tempo parado são configuráveis via UC03/UC04, nunca fixos no código (critério de aceitação da especificação).

9. **Uma única aplicação web responsiva, sem apps nativos.** Entregadores e supervisores usam a mesma aplicação, adaptada a desktop e mobile via responsividade (RNF02), consistente com "aplicativo nativo publicado em lojas" estar fora do escopo. Ver [ADR-008](decisoes/ADR-008-stack-tecnologico.md).

10. **Toda spec tem critérios de aceitação testáveis.** Formato `Dado / Quando / Então`, cobrindo fluxo principal, cada alternativo e cada RN aplicável, com valores concretos para casos de cálculo.

11. **Nenhuma regra de negócio é inventada silenciosamente.** O que não está na especificação nem em uma decisão registrada em `decisoes/` vai para a seção "Questões em aberto" da spec correspondente.
