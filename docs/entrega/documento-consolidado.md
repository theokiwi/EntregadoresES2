# Documento Consolidado — Sistema de Monitoramento de Tempo Parado em Roteiros

**Trabalho 2 — Engenharia de Software II — PUC Minas**
**Prof. Sandro Laudares**


## 1. Introdução e escopo

# Entregadores — Sistema de Monitoramento de Tempo Parado em Roteiros

MVP (Mínimo Produto Viável) para controle de roteiros e tempo parado de entregadores/motoristas de uma transportadora, desenvolvido como 2º Trabalho Avaliativo da disciplina Engenharia de Software II (Prof. Sandro Laudares, PUC Minas).

## Contexto e problema

Empresas de logística e entrega urbana precisam saber onde e por quanto tempo seus profissionais de campo ficam parados durante o roteiro diário. Hoje esse tempo é invisível: não há registro confiável de quanto tempo o entregador permanece em cada ponto do trajeto, o que impede identificar gargalos, renegociar prazos com clientes e calcular corretamente o custo real de cada rota.

## Objetivo do MVP

- Identificar quanto tempo o entregador/motorista fica parado em cada ponto do roteiro diário.
- Registrar e persistir pontos, roteiros e tempos coletados.
- Apresentar um painel (dashboard) com gráficos de tempo parado por dia, mês e período.
- Calcular indicadores de custo associados ao trajeto (custo por km percorrido, consumo km/litro).

## Escopo

**Dentro do escopo:** cadastro de motoristas/motoboys, gerentes/coordenadores, pontos e roteiros; coleta de chegada/saída por ponto; cálculo de tempo parado; histórico por período; dashboard; parametrização de custos e jornada padrão (8h/dia).

**Fora do escopo:** roteirização automática/otimização de rotas, integração com folha de pagamento/ERP, telemetria embarcada em tempo real, app nativo publicado em lojas.

## Regras de negócio principais

| ID | Regra |
|---|---|
| RN01 | O ponto de partida não conta tempo parado. |
| RN02 | Tempo parado no ponto = horário de saída − horário de chegada. |
| RN03 | Tempo total parado do roteiro = soma dos tempos parados, exceto o ponto de partida. |
| RN04 | Jornada padrão de 8h/dia, usada como base percentual dos indicadores. |
| RN05 | Cada roteiro pertence a um único motorista e a uma única data. |
| RN06 | Pontos possuem ordem sequencial que define o trajeto do dia. |
| RN07 | Custo do trajeto = combustível × rendimento km/litro × distância percorrida. |

Lista completa de requisitos funcionais (RF01–RF12) e não funcionais (RNF01–RNF06) na especificação de referência.

## Documentação

- [`docs/referencia/especificacao-requisitos.pdf`](docs/referencia/especificacao-requisitos.pdf) — especificação de requisitos oficial do trabalho (fonte de verdade).
- [`docs/prompt-claude-code-casos-de-uso.md`](docs/prompt-claude-code-casos-de-uso.md) — prompt de referência para geração da documentação de casos de uso, diagramas de robustez e classes (Spec Driven Development).

## Status

🚧 1ª parte — Projeto Preliminar (especificação, casos de uso, diagramas de robustez e classes) em andamento.


### Constituição

### Constituição

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


### Glossário

### Glossário

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


## 2. Atores

### Atores

Hierarquia de escopo: **Estabelecimento** (tenant) → **Unidade** (filial) → dados operacionais (Entregadores, Pontos, Roteiros). Ver [ADR-004](decisoes/ADR-004-multi-tenant-estabelecimento.md).

#### Entregador
Corresponde a motorista/motoboy da especificação. Pertence a uma Unidade.

**Responsabilidades:** iniciar roteiro, registrar chegada e saída em cada ponto, finalizar roteiro, consultar o próprio roteiro do dia e o próprio histórico.

**Restrições:** só acessa dados da própria Unidade; só consulta o próprio histórico, nunca o de outro entregador (RNF06, [ADR-003](decisoes/ADR-003-historico-entregador.md)).

#### Supervisor local
Corresponde a gerente/coordenador da especificação. Atua sobre uma única Unidade.

**Responsabilidades:** cadastrar entregadores e pontos da sua Unidade, montar roteiros diários, registrar pedidos/endereços de entrega, corrigir registros de chegada/saída (com auditoria), consultar trilha de auditoria, visualizar dashboard e histórico, consultar custo estimado, exportar relatórios — tudo restrito à própria Unidade.

#### Supervisor geral
Corresponde a administrador/dono da especificação. Herda todas as permissões de Supervisor local (generalização de atores em UML), com visão consolidada de **todas as Unidades do seu Estabelecimento** — nunca de outro Estabelecimento.

**Responsabilidades adicionais:** cadastrar Unidades, cadastrar Supervisores locais, parametrizar custos e jornada/regras de tempo parado, gerenciar perfis de acesso.

#### Sistema (ator não humano, casos de uso incluídos)
Executa cálculos derivados que nunca são informados manualmente: tempo parado por ponto e total do roteiro (UC15), distância percorrida e custo estimado do roteiro (UC23).

#### Fora de escopo
A criação de um novo Estabelecimento (onboarding de um novo tenant/cliente da plataforma) não está descrita na especificação original e não é modelada como caso de uso do sistema neste MVP — é tratada como provisionamento operacional pela equipe do produto. Ver questão em aberto registrada em [ADR-004](decisoes/ADR-004-multi-tenant-estabelecimento.md).


## 3. Arquitetura

### Arquitetura

Visão de tecnologias e diagramas estruturais do MVP. Decisão registrada em [ADR-008](../decisoes/ADR-008-stack-tecnologico.md); pressupõe o modelo multi-tenant de [ADR-004](../decisoes/ADR-004-multi-tenant-estabelecimento.md).

#### Requisitos de arquitetura que guiaram as escolhas

- Multi-tenant: um Estabelecimento nunca acessa dados de outro (RNF04 estendido, [ADR-004](../decisoes/ADR-004-multi-tenant-estabelecimento.md)).
- Uma aplicação usável por Entregadores e por Supervisores, em desktop e mobile, sem app nativo publicado em loja (RNF02, fora de escopo original).
- Tempo de resposta do dashboard < 3s para até 12 meses de dados (RNF03).
- Persistência com histórico completo e auditoria de alterações (RNF01, RNF05).

#### Tecnologias

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Front-end | React + TypeScript (SPA responsiva) | Um único código-fonte atende desktop e mobile via layout responsivo; TypeScript compartilha tipos com o back-end. |
| Gráficos do dashboard | Recharts | Biblioteca de gráficos React madura, suficiente para os recortes dia/mês/período de RF08. |
| Back-end | Node.js + NestJS + TypeScript | API REST estruturada em módulos, injeção de dependência facilita isolar a lógica de cálculo (tempo parado, custo) em serviços testáveis; TypeScript ponta a ponta. |
| ORM | Prisma | Migrações versionadas e tipagem gerada a partir do schema, reduz erro no filtro obrigatório por `estabelecimento_id`. |
| Banco de dados | PostgreSQL | Suporta bem consultas agregadas do dashboard (RNF03) e índices compostos por `estabelecimento_id`/`unidade_id`. |
| Autenticação | JWT (perfil, `estabelecimentoId`, `unidadeId` no token) | Autorização por perfil e escopo multi-tenant resolvidos a cada requisição sem consulta extra. |
| Empacotamento | Docker (um contêiner por serviço: front, back, banco) | Ambiente reprodutível para desenvolvimento e para a entrega do MVP. |

#### Estratégia multi-tenant

Banco de dados compartilhado (não há um banco por Estabelecimento). Toda tabela operacional (`Unidade`, `Entregador`, `Ponto`, `Roteiro`, `Parametro`, `Auditoria`) tem coluna `estabelecimento_id`. Um middleware no back-end injeta o `estabelecimentoId` do token JWT em toda consulta — nenhuma query de aplicação pode omitir esse filtro. Escolhida em vez de schema-por-tenant/banco-por-tenant por ser mais simples de operar no escopo do MVP; o risco de vazamento entre tenants por esquecimento de filtro é mitigado concentrando o filtro no middleware, não em cada endpoint.

#### Diagramas

- [`diagrama-componentes.puml`](diagrama-componentes.puml) — componentes do front-end e back-end e suas dependências.
- [`diagrama-execucao.puml`](diagrama-execucao.puml) — nós físicos/contêineres e onde cada componente roda (diagrama de implantação).

#### Questões em aberto

- Autenticação federada (SSO) não foi solicitada; assumido login com usuário/senha próprio da aplicação.
- Estratégia de escalonamento (múltiplas instâncias do back-end, cache) não é necessária para o escopo de MVP e não foi detalhada.
- Provisionamento de um novo Estabelecimento (tenant) é operacional, fora do escopo dos diagramas de execução do MVP (ver [ADR-004](../decisoes/ADR-004-multi-tenant-estabelecimento.md)).


![Diagrama de componentes](../diagramas/arquitetura/diagrama-componentes.png)


![Diagrama de execução (implantação)](../diagramas/arquitetura/diagrama-execucao.png)


## 4. Cenários, casos de uso e robustez


### Transversal — Autenticação

#### Objetivo do cenário
Modelar, uma única vez, o login de qualquer ator do sistema (Entregador, Supervisor local, Supervisor geral) e a resolução do seu perfil, Unidade e Estabelecimento — pré-requisito textual de todos os demais casos de uso, sem aparecer como `«include»` em cada um deles.

#### Atores
- **Entregador**, **Supervisor local**, **Supervisor geral** (ver [atores.md](../../atores.md)). Supervisor geral herda Supervisor local (generalização de atores).

#### Caso de uso do cenário
| UC | Nome | Ator | Rastreio |
|---|---|---|---|
| UC00 | Autenticar-se | Todos | RNF04 |

#### Pré-condições gerais do cenário
- O usuário possui uma credencial (e-mail/senha) previamente cadastrada por um Supervisor (UC02 Cadastrar supervisor local, UC05 Gerenciar perfis de acesso, UC06 Cadastrar entregador), associada a um perfil fixo ([ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md)) e, quando aplicável, a uma Unidade dentro de um Estabelecimento ([ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md)).

#### Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml). Único ponto do projeto em que a generalização de atores Supervisor geral → Supervisor local é desenhada (repetida textualmente em C1, mas o diagrama vive aqui).

#### Decisão de modelagem (não reaberta)
Autenticação é modelada uma única vez, neste diagrama transversal. Nenhum outro caso de uso usa `«include»` de UC00 — a pré-condição "ator autenticado" é apenas textual nas demais specs.

#### Decisões aplicadas neste cenário
- [ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md) — login resolve Estabelecimento e Unidade do usuário.
- [ADR-008](../../decisoes/ADR-008-stack-tecnologico.md) — sessão via JWT com claims de perfil, `estabelecimentoId`, `unidadeId`.
- [ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md) — três perfis fixos resolvidos no login.


![Diagrama de casos de uso — Transversal-autenticacao](../diagramas/cenarios/Transversal-autenticacao/Transversal-casos-de-uso.png)


### UC00 — Autenticar-se

#### 1. Cabeçalho
- **ID:** UC00
- **Nome:** Autenticar-se
- **Cenário(s):** Transversal — pré-requisito de todos os demais cenários
- **Ator principal:** Entregador, Supervisor local, Supervisor geral
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RNF04

#### 2. Objetivo
Como usuário do sistema (Entregador ou Supervisor), quero autenticar-me com minhas credenciais para acessar apenas as funcionalidades e os dados do meu perfil, da minha Unidade e do meu Estabelecimento.

#### 3. Pré-condições e gatilho
**Pré-condições:** usuário possui credencial (e-mail/senha) previamente cadastrada por um Supervisor, com um perfil fixo atribuído ([ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md)).
**Gatilho:** usuário acessa a aplicação e informa e-mail e senha.

#### 4. Fluxo principal
1. Usuário informa e-mail e senha na tela de login.
2. Sistema valida a credencial (compara hash de senha).
3. Sistema resolve o perfil do usuário (Entregador | Supervisor local | Supervisor geral), o `estabelecimentoId` e o `unidadeId` (quando aplicável — Supervisor geral não tem Unidade única).
4. Sistema emite um token de sessão (JWT) contendo perfil, `estabelecimentoId` e `unidadeId`, com validade de 8 horas (alinhada à jornada padrão, RN04).
5. Sistema redireciona o usuário para a tela inicial do seu perfil (roteiro do dia para Entregador; dashboard para Supervisor).

#### 5. Fluxos alternativos e de exceção
- **2a. E-mail ou senha inválidos:** sistema exibe mensagem genérica "e-mail ou senha inválidos" (não revela qual dos dois está errado, por segurança) e não emite token.
- **2b. Usuário inativo/desligado:** sistema bloqueia o login e exibe "usuário inativo, contate seu supervisor".
- **4a. Token expira durante o uso:** sistema exige novo login na próxima ação que exija autenticação.

#### 6. Pós-condições
- **Sucesso:** token de sessão válido emitido, contendo perfil, `estabelecimentoId` e `unidadeId`; usuário redirecionado à tela inicial do seu perfil.
- **Falha:** nenhum token emitido; usuário permanece na tela de login.

#### 7. Regras de negócio aplicadas
- **RNF04** (passos 3–4): controle de acesso por perfil resolvido no login e aplicado a toda requisição subsequente via claims do token.

#### 8. Dados
- **Leitura:** `Usuario` (id, email, senhaHash, perfil, estabelecimentoId, unidadeId nullable, ativo).
- **Escrita:** nenhuma persistente (token é stateless/JWT); opcionalmente log de tentativa de login para auditoria de segurança (fora do escopo funcional de RNF05, que cobre auditoria de dados operacionais).

#### 9. Critérios de aceitação
- **Dado** um Supervisor local com e-mail `maria@transportadora.com` e senha correta, **quando** ele se autentica, **então** o sistema emite um token com perfil `SupervisorLocal`, o `estabelecimentoId` e o `unidadeId` corretos, e o redireciona ao dashboard.
- **Dado** um usuário que informa a senha incorreta, **quando** tenta autenticar, **então** o sistema exibe "e-mail ou senha inválidos" e não emite token.
- **Dado** um usuário marcado como inativo, **quando** tenta autenticar com credenciais corretas, **então** o sistema bloqueia o login e informa que o usuário está inativo.
- **Dado** um Entregador autenticado há mais de 8 horas, **quando** tenta registrar uma chegada (UC12), **então** o sistema exige novo login antes de prosseguir.

#### 10. Requisitos não funcionais relevantes
- RNF04 — controle de acesso por perfil.
- RNF06 (LGPD/boas práticas) — senha nunca armazenada nem trafega em texto puro (hash + HTTPS); mensagens de erro de login não revelam se o e-mail existe na base.

#### 11. Questões em aberto
Resolvidas proativamente para manter o MVP enxuto, sem necessidade de validação externa:
- **Recuperação de senha:** fora do escopo deste MVP. Senha inicial é definida pelo Supervisor ao cadastrar o usuário (UC02/UC05/UC06); redefinição, se necessária, é feita por um Supervisor, não por fluxo de autoatendimento. Pode ser adicionado em iteração futura.
- **Bloqueio por tentativas malsucedidas:** não implementado no MVP (mantém o fluxo simples); mitigação de força bruta fica a cargo de rate-limiting de infraestrutura, fora do escopo desta documentação de casos de uso.
- **Duração da sessão:** fixada em 8 horas, alinhada à jornada padrão (RN04) — decisão de engenharia, não uma regra de negócio da especificação.


![UC00 — diagrama de robustez](../diagramas/cenarios/Transversal-autenticacao/UC00-robustez.png)


### C1 — Configuração inicial

#### Objetivo do cenário
Cobrir a configuração inicial de um Estabelecimento por seu Supervisor geral: estruturar Unidades (filiais), delegar a gestão local a Supervisores locais, parametrizar custos e jornada, e definir perfis de acesso — tudo isolado ao próprio Estabelecimento (multi-tenant).

#### Atores
- **Supervisor geral** — ator principal de todos os UCs deste cenário.
- **Supervisor local** — introduzido aqui por generalização de atores (herda os casos de uso de Supervisor local; ver diagrama).

#### Casos de uso do cenário
| UC | Nome | Rastreio |
|---|---|---|
| UC01 | Cadastrar unidade | extensão (Unidade) |
| UC02 | Cadastrar supervisor local | RF02 |
| UC03 | Parametrizar custos (combustível, custo/km) | RF09 |
| UC04 | Parametrizar jornada e regras de tempo parado | RF10, RN04 |
| UC05 | Gerenciar perfis de acesso | RNF04 |

#### Pré-condições gerais do cenário
- Supervisor geral autenticado (UC00), associado a um Estabelecimento já existente (provisionamento de Estabelecimento é operacional, fora do escopo — [ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md)).

#### Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml). Mostra a generalização de atores Supervisor geral → Supervisor local, introduzida neste cenário.

#### Decisões aplicadas neste cenário
- [ADR-001](../../decisoes/ADR-001-unidade.md) — conceito de Unidade.
- [ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md) — Unidade pertence a um Estabelecimento; isolamento multi-tenant.
- [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md) — UC03 não parametriza km/litro (é atributo do Entregador, cadastrado em UC06/C2).
- [ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md) — UC05 atribui um dos três perfis fixos, não cria papéis customizados.


![Diagrama de casos de uso — C1-configuracao-inicial](../diagramas/cenarios/C1-configuracao-inicial/C1-casos-de-uso.png)


### UC01 — Cadastrar unidade

#### 1. Cabeçalho
- **ID:** UC01
- **Nome:** Cadastrar unidade
- **Cenário(s):** C1 — Configuração inicial
- **Ator principal:** Supervisor geral
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** extensão (Unidade) — ver [ADR-001](../../decisoes/ADR-001-unidade.md), [ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md)

#### 2. Objetivo
Como Supervisor geral, quero cadastrar uma nova Unidade (filial) no meu Estabelecimento para poder organizar equipes e roteiros por filial.

#### 3. Pré-condições e gatilho
**Pré-condições:** Supervisor geral autenticado, associado a um Estabelecimento.
**Gatilho:** Supervisor geral aciona "Nova unidade" na tela de gestão de unidades.

#### 4. Fluxo principal
1. Supervisor geral acessa a tela de cadastro de unidade.
2. Supervisor geral informa nome, endereço e fuso horário da Unidade (constituição, item 6 — fuso horário único por Unidade).
3. Sistema valida que o nome é único dentro do Estabelecimento.
4. Sistema grava a Unidade, associada ao `estabelecimentoId` do Supervisor geral autenticado.
5. Sistema exibe confirmação e a Unidade passa a estar disponível para cadastro de Entregadores, Pontos e Supervisores locais.

#### 5. Fluxos alternativos e de exceção
- **3a. Nome de unidade já existe no mesmo Estabelecimento:** sistema bloqueia e informa o conflito.

#### 6. Pós-condições
- **Sucesso:** Unidade criada e vinculada ao Estabelecimento.
- **Falha:** nenhuma Unidade criada.

#### 7. Regras de negócio aplicadas
Nenhuma RN numerada diretamente — extensão registrada em ADR-001/ADR-004 aplicada nos passos 3–4 (unicidade dentro do Estabelecimento, vínculo obrigatório ao Estabelecimento).

#### 8. Dados
- **Leitura:** `Estabelecimento` (id do Supervisor geral autenticado).
- **Escrita:** `Unidade` (id, nome, endereço, fusoHorario, estabelecimentoId).

#### 9. Critérios de aceitação
- **Dado** o Supervisor geral do Estabelecimento "Transportes Rápido", **quando** ele cadastra a unidade "Filial Centro", **então** a Unidade é criada vinculada ao Estabelecimento "Transportes Rápido".
- **Dado** que já existe uma unidade "Filial Centro" no mesmo Estabelecimento, **quando** o Supervisor geral tenta cadastrar outra unidade com o mesmo nome, **então** o sistema bloqueia e informa o conflito.

#### 10. Requisitos não funcionais relevantes
- RNF04 — apenas Supervisor geral executa este caso de uso.

#### 11. Questões em aberto
Nenhuma.


![UC01 — diagrama de robustez](../diagramas/cenarios/C1-configuracao-inicial/UC01-robustez.png)


### UC02 — Cadastrar supervisor local

#### 1. Cabeçalho
- **ID:** UC02
- **Nome:** Cadastrar supervisor local
- **Cenário(s):** C1 — Configuração inicial
- **Ator principal:** Supervisor geral
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF02

#### 2. Objetivo
Como Supervisor geral, quero cadastrar um Supervisor local vinculado a uma Unidade para delegar a gestão do dia a dia daquela filial.

#### 3. Pré-condições e gatilho
**Pré-condições:** pelo menos uma Unidade cadastrada no Estabelecimento (UC01).
**Gatilho:** Supervisor geral aciona "Novo supervisor local".

#### 4. Fluxo principal
1. Supervisor geral acessa a tela de cadastro de supervisor.
2. Supervisor geral informa nome, telefone, e-mail e seleciona a Unidade (dentre as do próprio Estabelecimento).
3. Sistema valida que o e-mail é único dentro do Estabelecimento.
4. Sistema cria o usuário com perfil "Supervisor local" ([ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md)), vinculado à Unidade selecionada.
5. Sistema envia um convite por e-mail com link para definição de senha; usuário fica com status "Convite pendente" até o primeiro acesso.

#### 5. Fluxos alternativos e de exceção
- **3a. E-mail já cadastrado no Estabelecimento:** sistema bloqueia e informa o conflito.

#### 6. Pós-condições
- **Sucesso:** usuário Supervisor local criado, vinculado à Unidade e ao Estabelecimento, status "Convite pendente".
- **Falha:** nenhum usuário criado.

#### 7. Regras de negócio aplicadas
RF02, aplicada nos passos 2–4 (cadastro do gerente/coordenador). Isolamento por Estabelecimento ([ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md)) aplicado no passo 2 (só Unidades do próprio Estabelecimento aparecem para seleção).

#### 8. Dados
- **Leitura:** `Unidade` (lista das Unidades do Estabelecimento).
- **Escrita:** `Supervisor` (id, nome, telefone, email, perfil=SupervisorLocal, unidadeId, estabelecimentoId, status).

#### 9. Critérios de aceitação
- **Dado** a unidade "Filial Centro" cadastrada, **quando** o Supervisor geral cadastra João (joao@empresa.com) vinculado a essa unidade, **então** o sistema cria o usuário com perfil Supervisor local, status "Convite pendente", e envia o convite por e-mail.
- **Dado** que joao@empresa.com já está cadastrado no Estabelecimento, **quando** o Supervisor geral tenta cadastrá-lo novamente, **então** o sistema bloqueia e informa o conflito.

#### 10. Requisitos não funcionais relevantes
- RNF04 — apenas Supervisor geral executa este caso de uso.
- RNF06 — apenas os dados pessoais necessários (nome, telefone, e-mail) são coletados.

#### 11. Questões em aberto
Nenhuma. Decisão de implementação: convite por e-mail com definição de senha própria (sem transmitir senha em texto), abordagem padrão de mercado para provisionamento de usuário.


![UC02 — diagrama de robustez](../diagramas/cenarios/C1-configuracao-inicial/UC02-robustez.png)


### UC03 — Parametrizar custos

#### 1. Cabeçalho
- **ID:** UC03
- **Nome:** Parametrizar custos (combustível, custo/km)
- **Cenário(s):** C1 — Configuração inicial
- **Ator principal:** Supervisor geral
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF09 (ver [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md))

#### 2. Objetivo
Como Supervisor geral, quero parametrizar o valor do combustível e o custo por km de uma Unidade para que o sistema calcule corretamente o custo dos roteiros daquela filial.

#### 3. Pré-condições e gatilho
**Pré-condições:** Unidade cadastrada (UC01). Parâmetros de custo são definidos por Unidade, pois o preço de combustível varia por região.
**Gatilho:** Supervisor geral acessa "Parametrizar custos" para uma Unidade.

#### 4. Fluxo principal
1. Supervisor geral seleciona a Unidade.
2. Supervisor geral informa o valor do combustível (R$/L) e o custo por km.
3. Sistema valida que ambos os valores são maiores que zero.
4. Sistema grava os parâmetros vinculados à Unidade.
5. Sistema exibe confirmação.

#### 5. Fluxos alternativos e de exceção
- **3a. Valor informado é zero ou negativo:** sistema bloqueia e informa que o valor deve ser positivo.

#### 6. Pós-condições
- **Sucesso:** `Parametro.valorCombustivel` e `Parametro.custoPorKm` atualizados para a Unidade.
- **Falha:** valores anteriores mantidos.

#### 7. Regras de negócio aplicadas
RF09, aplicada nos passos 2–4. Este parâmetro **não inclui** km/litro do veículo — rendimento é atributo do Entregador ([ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md)), usado por RN07 em [UC23](../C4-entregador-sai-para-fazer-entregas/UC23-calcular-distancia-e-custo-do-roteiro.md).

#### 8. Dados
- **Escrita:** `Parametro` (unidadeId, valorCombustivel: decimal > 0, custoPorKm: decimal > 0).

#### 9. Critérios de aceitação
- **Dado** a unidade "Filial Centro", **quando** o Supervisor geral define `valorCombustivel = R$ 6,00` e `custoPorKm = R$ 0,80`, **então** os parâmetros são gravados para essa Unidade.
- **Dado** um valor de combustível igual a `-1`, **quando** o Supervisor geral tenta salvar, **então** o sistema bloqueia e informa que o valor deve ser positivo.

#### 10. Requisitos não funcionais relevantes
- Constituição, item 8 — parametrização sem alteração de código.

#### 11. Questões em aberto
Nenhuma.


![UC03 — diagrama de robustez](../diagramas/cenarios/C1-configuracao-inicial/UC03-robustez.png)


### UC04 — Parametrizar jornada e regras de tempo parado

#### 1. Cabeçalho
- **ID:** UC04
- **Nome:** Parametrizar jornada e regras de tempo parado
- **Cenário(s):** C1 — Configuração inicial
- **Ator principal:** Supervisor geral
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Should
- **Rastreio:** RF10, RN04

#### 2. Objetivo
Como Supervisor geral, quero configurar a jornada padrão de trabalho de uma Unidade para que os indicadores de tempo parado usem a base percentual correta.

#### 3. Pré-condições e gatilho
**Pré-condições:** Unidade cadastrada (UC01); jornada padrão inicial é 8 horas/dia (valor default da especificação) até ser alterada.
**Gatilho:** Supervisor geral acessa "Parametrizar jornada" para uma Unidade.

#### 4. Fluxo principal
1. Supervisor geral seleciona a Unidade.
2. Sistema exibe a jornada padrão atual (8h/dia, se nunca configurada).
3. Supervisor geral informa a nova jornada padrão, em horas por dia.
4. Sistema valida que o valor está entre 1 e 24 horas.
5. Sistema grava a jornada padrão da Unidade.
6. Sistema exibe confirmação.

#### 5. Fluxos alternativos e de exceção
- **4a. Valor fora do intervalo válido (ex.: 0 ou 30):** sistema bloqueia e informa o intervalo permitido (1–24 horas).

#### 6. Pós-condições
- **Sucesso:** `Parametro.jornadaPadraoHoras` atualizado para a Unidade, usado por [UC18](../C6-acompanhamento-e-analise/UC18-visualizar-dashboard.md) como base percentual dos indicadores de tempo parado (RN04).
- **Falha:** valor anterior mantido.

#### 7. Regras de negócio aplicadas
- **RN04** (passos 2 e 5): jornada padrão de 8h/dia serve de base percentual para os indicadores de tempo parado; este UC é onde esse valor é definido/ajustado por Unidade.

#### 8. Dados
- **Escrita:** `Parametro` (unidadeId, jornadaPadraoHoras: inteiro, 1–24, default 8).

#### 9. Critérios de aceitação
- **Dado** uma Unidade recém-cadastrada sem parametrização prévia, **quando** o sistema consulta a jornada padrão, **então** retorna 8 horas/dia (default da especificação).
- **Dado** a unidade "Filial Centro", **quando** o Supervisor geral altera a jornada padrão para 6 horas, **então** `Parametro.jornadaPadraoHoras = 6` passa a ser usado nos indicadores de dashboard dessa Unidade.
- **Dado** o valor `30` informado, **quando** o Supervisor geral tenta salvar, **então** o sistema bloqueia por estar fora do intervalo 1–24.

#### 10. Requisitos não funcionais relevantes
- Constituição, item 8 — parametrização sem alteração de código.

#### 11. Questões em aberto
Nenhuma.


![UC04 — diagrama de robustez](../diagramas/cenarios/C1-configuracao-inicial/UC04-robustez.png)


### UC05 — Gerenciar perfis de acesso

#### 1. Cabeçalho
- **ID:** UC05
- **Nome:** Gerenciar perfis de acesso
- **Cenário(s):** C1 — Configuração inicial
- **Ator principal:** Supervisor geral
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RNF04 (ver [ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md))

#### 2. Objetivo
Como Supervisor geral, quero atribuir ou alterar o perfil de acesso e a Unidade de um usuário para manter o controle de quem pode fazer o quê no sistema.

#### 3. Pré-condições e gatilho
**Pré-condições:** usuário já cadastrado (via UC02 Cadastrar supervisor local ou UC06 Cadastrar entregador).
**Gatilho:** Supervisor geral busca um usuário na tela de gestão de perfis e aciona "Editar perfil".

#### 4. Fluxo principal
1. Supervisor geral busca o usuário pelo nome ou e-mail.
2. Sistema exibe o perfil atual (Entregador, Supervisor local ou Supervisor geral) e a Unidade vinculada.
3. Supervisor geral seleciona um dos três perfis fixos ([ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md)) e/ou uma nova Unidade.
4. Sistema valida que a Unidade selecionada pertence ao mesmo Estabelecimento do Supervisor geral.
5. Sistema grava a alteração e registra um evento de auditoria (autor, data/hora, perfil/Unidade antigos e novos).
6. Sistema exibe confirmação.

#### 5. Fluxos alternativos e de exceção
- **4a. Unidade selecionada pertence a outro Estabelecimento:** sistema bloqueia (nunca listada como opção, por isolamento multi-tenant — [ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md)).

#### 6. Pós-condições
- **Sucesso:** perfil e/ou Unidade do usuário atualizados; registro de auditoria criado.
- **Falha:** nenhuma alteração.

#### 7. Regras de negócio aplicadas
RNF04, aplicada nos passos 3–4 (perfis fixos, escopo por Unidade/Estabelecimento).

#### 8. Dados
- **Leitura:** `Supervisor`/`Entregador` (usuário-alvo), `Unidade` (opções do Estabelecimento).
- **Escrita:** `Supervisor`/`Entregador`.perfil, `.unidadeId`; `Auditoria` (autor, timestamp, valores antigo/novo).

#### 9. Critérios de aceitação
- **Dado** a usuária Maria com perfil Entregador na Unidade "Filial Centro", **quando** o Supervisor geral a promove a Supervisor local da mesma Unidade, **então** o perfil é atualizado e um registro de auditoria é criado.
- **Dado** uma tentativa de vincular um usuário a uma Unidade de outro Estabelecimento, **quando** o Supervisor geral confirma, **então** o sistema bloqueia a operação.

#### 10. Requisitos não funcionais relevantes
- RNF04 — controle de acesso por perfil.
- RNF05 — toda alteração de perfil/Unidade é auditada.

#### 11. Questões em aberto
Nenhuma.


![UC05 — diagrama de robustez](../diagramas/cenarios/C1-configuracao-inicial/UC05-robustez.png)


### C2 — Montagem da equipe e da base de pontos

#### Objetivo do cenário
Cobrir o cadastro da base operacional de uma Unidade antes do planejamento diário: os entregadores que executarão os roteiros e os pontos (endereços geolocalizados) que poderão compor um roteiro.

#### Atores
- **Supervisor local** (ator principal de UC06 e UC07).

#### Casos de uso do cenário
| UC | Nome | Rastreio |
|---|---|---|
| UC06 | Cadastrar entregador (veículo, km/litro) | RF01 |
| UC07 | Cadastrar ponto (endereço, coordenadas) | RF03 |

#### Pré-condições gerais do cenário
- Supervisor local autenticado (UC00), pertencente a uma Unidade de um Estabelecimento.
- Toda entidade criada neste cenário (`Entregador`, `Ponto`) é automaticamente associada à Unidade do Supervisor local autenticado — nunca a outra Unidade ([ADR-001](../../decisoes/ADR-001-unidade.md), [ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md)).

#### Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml).

#### Decisões aplicadas neste cenário
- [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md) — rendimento km/litro é atributo do Entregador/veículo, cadastrado em UC06 (não em UC03/Parâmetro).
- [ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md) — latitude/longitude são obrigatórias em UC07, eliminando estruturalmente o caso de Ponto sem coordenadas usado depois em UC23.


![Diagrama de casos de uso — C2-montagem-equipe-e-base-de-pontos](../diagramas/cenarios/C2-montagem-equipe-e-base-de-pontos/C2-casos-de-uso.png)


### UC06 — Cadastrar entregador

#### 1. Cabeçalho
- **ID:** UC06
- **Nome:** Cadastrar entregador
- **Cenário(s):** C2 — Montagem da equipe e da base de pontos
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF01 (ver [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md))

#### 2. Objetivo
Como Supervisor local, quero cadastrar um entregador da minha Unidade, com os dados do seu veículo, para que ele possa executar roteiros.

#### 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado.
**Gatilho:** Supervisor local aciona "Novo entregador" na tela de gestão de equipe.

#### 4. Fluxo principal
1. Supervisor local acessa a tela de cadastro de entregador.
2. Supervisor local informa nome, telefone, documento (CPF), dados do veículo e rendimento km/litro.
3. Sistema valida os dados informados (seção 8).
4. Sistema grava o Entregador, associado à Unidade do Supervisor local autenticado.
5. Sistema confirma o cadastro e exibe o entregador na lista da Unidade.

#### 5. Fluxos alternativos e de exceção
- **3a. CPF já cadastrado no mesmo Estabelecimento:** sistema bloqueia o cadastro e informa que já existe um entregador com esse documento.
- **3b. Campo obrigatório ausente ou rendimento km/litro ≤ 0:** sistema bloqueia o cadastro e sinaliza os campos inválidos.

#### 6. Pós-condições
- **Sucesso:** novo `Entregador` persistido, associado à Unidade, disponível para ser escolhido em `UC09 Montar roteiro diário`.
- **Falha:** nenhum registro criado.

#### 7. Regras de negócio aplicadas
Nenhuma RN da especificação incide diretamente neste UC (é um cadastro base); a associação à Unidade decorre da extensão [ADR-001](../../decisoes/ADR-001-unidade.md)/[ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md).

#### 8. Dados
- **Escrita:** `Entregador` — `id`, `nome` (texto, obrigatório), `telefone` (texto, obrigatório, formato `(DD) 9XXXX-XXXX`), `documento` (CPF, 11 dígitos, obrigatório, único por Estabelecimento), `veiculo` (texto, ex. placa/modelo, obrigatório), `rendimentoKmLitro` (decimal > 0, obrigatório), `unidadeId` (obrigatório, preenchido automaticamente).

#### 9. Critérios de aceitação
- **Dado** um Supervisor local autenticado na Unidade Centro, **quando** ele cadastra o entregador João, CPF 111.111.111-11, veículo "Moto Honda CG", rendimento 30 km/L, **então** o sistema cria o Entregador associado à Unidade Centro.
- **Dado** que já existe um entregador com CPF 111.111.111-11 no Estabelecimento, **quando** o Supervisor local tenta cadastrar outro entregador com o mesmo CPF, **então** o sistema bloqueia e informa duplicidade.
- **Dado** um cadastro com rendimento km/litro = 0, **quando** o Supervisor local tenta salvar, **então** o sistema bloqueia e sinaliza que o rendimento deve ser maior que zero.

#### 10. Requisitos não funcionais relevantes
- RNF06 — dado pessoal (CPF, telefone) tratado conforme LGPD: coletado apenas para fins operacionais do cadastro.

#### 11. Questões em aberto
Nenhuma — validações de unicidade (CPF por Estabelecimento) e obrigatoriedade de campos resolvidas nesta spec como decisão de implementação de MVP.


![UC06 — diagrama de robustez](../diagramas/cenarios/C2-montagem-equipe-e-base-de-pontos/UC06-robustez.png)


### UC07 — Cadastrar ponto

#### 1. Cabeçalho
- **ID:** UC07
- **Nome:** Cadastrar ponto
- **Cenário(s):** C2 — Montagem da equipe e da base de pontos; incluído condicionalmente por UC08 em C3 ([ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md))
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF03 (ver [ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md))

#### 2. Objetivo
Como Supervisor local, quero cadastrar um ponto (endereço geolocalizado) na base da minha Unidade, para que ele possa ser usado em roteiros.

#### 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado.
**Gatilho:** Supervisor local aciona "Novo ponto" na tela de gestão de pontos, ou UC08 dispara este caso de uso ao receber um endereço novo.

#### 4. Fluxo principal
1. Supervisor local (ou UC08) informa endereço (logradouro, número, cidade, CEP) e coordenadas (latitude, longitude).
2. Sistema valida os dados informados.
3. Sistema grava o Ponto, associado à Unidade do Supervisor local autenticado.
4. Sistema confirma o cadastro e exibe o ponto na base da Unidade.

#### 5. Fluxos alternativos e de exceção
- **2a. Latitude ou longitude ausentes ou fora da faixa válida:** sistema bloqueia o cadastro — coordenadas são obrigatórias ([ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md)).
- **2b. Campo de endereço obrigatório ausente:** sistema bloqueia o cadastro e sinaliza os campos inválidos.

#### 6. Pós-condições
- **Sucesso:** novo `Ponto` persistido, associado à Unidade, disponível para compor um Roteiro (`UC09`).
- **Falha:** nenhum registro criado.

#### 7. Regras de negócio aplicadas
Nenhuma RN da especificação incide diretamente neste UC; a obrigatoriedade de coordenadas é uma extensão registrada em [ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md), necessária para viabilizar `UC23` (RF11/RN07).

#### 8. Dados
- **Escrita:** `Ponto` — `id`, `endereco` (texto, obrigatório: logradouro, número, cidade, CEP), `latitude` (decimal, obrigatório, −90 a 90), `longitude` (decimal, obrigatório, −180 a 180), `unidadeId` (obrigatório, preenchido automaticamente).

#### 9. Critérios de aceitação
- **Dado** um Supervisor local autenticado na Unidade Centro, **quando** ele cadastra o ponto "Rua Peru, 55" com latitude −19.921, longitude −43.937, **então** o sistema cria o Ponto associado à Unidade Centro.
- **Dado** um cadastro de ponto sem latitude/longitude informadas, **quando** o Supervisor local tenta salvar, **então** o sistema bloqueia e informa que as coordenadas são obrigatórias.
- **Dado** uma latitude informada como 200 (fora da faixa −90 a 90), **quando** o Supervisor local tenta salvar, **então** o sistema bloqueia e sinaliza valor inválido.

#### 10. Requisitos não funcionais relevantes
Nenhum diretamente aplicável.

#### 11. Questões em aberto
Nenhuma — cadastro duplicado do mesmo endereço não é bloqueado aqui (reuso de Ponto existente é resolvido no fluxo de UC08, [ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md)); geocodificação automática do endereço para coordenadas é um detalhe de implementação de UI, fora do escopo desta spec de caso de uso.


![UC07 — diagrama de robustez](../diagramas/cenarios/C2-montagem-equipe-e-base-de-pontos/UC07-robustez.png)


### C3 — Planejamento do dia

#### Objetivo do cenário
Cobrir a preparação do roteiro diário: registro dos endereços de entrega recebidos, montagem do roteiro sequencial para um Entregador, e a consulta do Entregador ao seu roteiro do dia antes de sair para as entregas (cenário C4).

#### Atores
- **Supervisor local** (UC08, UC09).
- **Entregador** (UC10).

#### Casos de uso do cenário
| UC | Nome | Ator | Rastreio |
|---|---|---|---|
| UC08 | Registrar pedidos/endereços de entrega | Supervisor local | Entregáveis (seção 9 da especificação); ver [ADR-006](../../decisoes/ADR-006-pedido-sem-entidade-propria.md) e [ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md) |
| UC09 | Montar roteiro diário | Supervisor local | RF04, RN05, RN06 |
| UC10 | Consultar roteiro do dia | Entregador | Decorrente de RF04/RF05 (requisito implícito, sem RF direto) |

#### Pré-condições gerais do cenário
- Supervisor local e Entregador autenticados (UC00), pertencentes à mesma Unidade.
- Entregadores (UC06) já cadastrados na Unidade.
- Base de Pontos (UC07) já possui ao menos os endereços recorrentes; novos endereços podem ser criados sob demanda em UC08.

#### Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml).

#### Decisões aplicadas neste cenário
- [ADR-006](../../decisoes/ADR-006-pedido-sem-entidade-propria.md) — "Pedido" não é entidade própria, alimenta `Ponto`.
- [ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md) — UC08 reaproveita Ponto existente ou inclui UC07 condicionalmente.
- [ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md) — coordenadas obrigatórias, herdado de UC07.


![Diagrama de casos de uso — C3-planejamento-do-dia](../diagramas/cenarios/C3-planejamento-do-dia/C3-casos-de-uso.png)


### UC08 — Registrar pedidos/endereços de entrega

#### 1. Cabeçalho
- **ID:** UC08
- **Nome:** Registrar pedidos/endereços de entrega
- **Cenário(s):** C3 — Planejamento do dia
- **Ator principal:** Supervisor local
- **Atores secundários:** Sistema (via `«include»` condicional de UC07)
- **Prioridade (MoSCoW):** Must
- **Rastreio:** Entregáveis (seção 9 da especificação, sem RF direto) — ver [ADR-006](../../decisoes/ADR-006-pedido-sem-entidade-propria.md) e [ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md)

#### 2. Objetivo
Como Supervisor local, quero registrar os endereços de entrega recebidos no dia para alimentar a base de pontos usada na montagem do roteiro.

#### 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado, associado a uma Unidade.
**Gatilho:** Chegada de um novo pedido/endereço de entrega a ser atendido.

#### 4. Fluxo principal
1. Supervisor local acessa a tela de registro de endereços de entrega.
2. Supervisor local informa o endereço do pedido.
3. Sistema busca, na base de Pontos da Unidade, um Ponto com endereço correspondente.
4. Sistema encontra um Ponto existente e o reaproveita, disponibilizando-o para seleção em `UC09`.
5. Sistema confirma o registro do endereço.

#### 5. Fluxos alternativos e de exceção
- **3a. Endereço não encontrado na base:** sistema inclui **UC07 Cadastrar ponto** (`«include»` condicional, [ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md)) para criar um novo Ponto com aquele endereço e coordenadas (RF03); ao concluir, o novo Ponto fica disponível para seleção em `UC09`, como no fluxo principal.
- **2a. Endereço informado incompleto ou inválido (ex.: sem número):** sistema bloqueia o registro e solicita a correção antes de prosseguir.

#### 6. Pós-condições
- **Sucesso:** Ponto correspondente ao endereço existe na base da Unidade e está disponível para seleção em `UC09`.
- **Falha:** nenhuma alteração.

#### 7. Regras de negócio aplicadas
Nenhuma RN da especificação se aplica diretamente a este caso de uso. A relação com `UC07` é regida por [ADR-006](../../decisoes/ADR-006-pedido-sem-entidade-propria.md) e [ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md).

#### 8. Dados
- **Leitura:** `Ponto` (busca por endereço dentro da `unidadeId`).
- **Escrita:** `Ponto` (criação, via inclusão de `UC07`, apenas quando não encontrado).

#### 9. Critérios de aceitação
- **Dado** que o endereço "Rua Peru, 55" já existe como Ponto cadastrado na Unidade Centro, **quando** o Supervisor local registra um pedido para esse endereço, **então** o sistema reaproveita o Ponto existente sem duplicar o cadastro.
- **Dado** que o endereço "Av. Nova, 200" ainda não existe na base de Pontos da Unidade, **quando** o Supervisor local registra um pedido para esse endereço, **então** o sistema inclui `UC07` e cria um novo Ponto com esse endereço e coordenadas antes de disponibilizá-lo.
- **Dado** um endereço informado sem número, **quando** o Supervisor local tenta registrar o pedido, **então** o sistema bloqueia o registro e solicita a correção do endereço.

#### 10. Requisitos não funcionais relevantes
- RNF01 — persistência com histórico completo da base de pontos.

#### 11. Questões em aberto
Nenhuma pendente de validação com o cliente — resolvidas via ADR-006 e ADR-010. Observação de escopo: dados específicos de um pedido externo (ex.: número do pedido, nome do cliente) não constam no modelo de dados da especificação (seção 8); se necessários no futuro, exigiriam uma extensão do modelo (nova entidade `Pedido` ou campos adicionais em `Ponto`), fora do escopo deste MVP.


![UC08 — diagrama de robustez](../diagramas/cenarios/C3-planejamento-do-dia/UC08-robustez.png)


### UC09 — Montar roteiro diário

#### 1. Cabeçalho
- **ID:** UC09
- **Nome:** Montar roteiro diário
- **Cenário(s):** C3 — Planejamento do dia
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF04, RN05, RN06

#### 2. Objetivo
Como Supervisor local, quero montar o roteiro diário de um Entregador, associando Pontos em ordem sequencial, para que ele saiba quais entregas fazer e em que ordem.

#### 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado; existem Pontos cadastrados na base da Unidade (UC07/UC08); Entregador cadastrado na Unidade (UC06).
**Gatilho:** Supervisor local decide montar o roteiro do dia para um Entregador.

#### 4. Fluxo principal
1. Supervisor local acessa a tela de montagem de roteiro e seleciona o Entregador e a data.
2. Sistema verifica se já existe um Roteiro para esse Entregador nessa data (RN05).
3. Supervisor local seleciona os Pontos a incluir no roteiro, a partir da base de Pontos da Unidade.
4. Supervisor local define a ordem sequencial dos Pontos (RN06), incluindo qual é o ponto de partida.
5. Sistema salva o Roteiro com status "Não iniciado", associado ao Entregador, à data e à lista ordenada de Pontos.

#### 5. Fluxos alternativos e de exceção
- **2a. Já existe um Roteiro para esse Entregador nessa data:** sistema bloqueia a criação de um novo roteiro e oferece editar o roteiro existente (RN05).
- **3a. Nenhum ponto selecionado:** sistema impede salvar um roteiro vazio.

#### 6. Pós-condições
- **Sucesso:** Roteiro criado, status "Não iniciado", Pontos em ordem sequencial, associado a um único Entregador e uma única data.
- **Falha:** nenhum roteiro criado ou alterado.

#### 7. Regras de negócio aplicadas
- **RN05** (passo 2/2a): cada Roteiro pertence a um único Entregador e a uma única data.
- **RN06** (passo 4): os pontos de um roteiro possuem ordem sequencial que define o trajeto do dia.

#### 8. Dados
- **Leitura:** `Ponto` (base da Unidade), `Entregador`.
- **Escrita:** `Roteiro` (id, data, entregadorId, unidadeId, status = `NaoIniciado`, lista ordenada de pontos).

#### 9. Critérios de aceitação
- **Dado** o entregador João sem roteiro cadastrado para 2026-09-24, **quando** o Supervisor local monta um roteiro com os pontos A, B e C nessa ordem, **então** o sistema cria o Roteiro com status "Não iniciado" e os pontos na sequência 1, 2, 3.
- **Dado** que o entregador João já possui um roteiro para 2026-09-24, **quando** o Supervisor local tenta montar um novo roteiro para ele nessa mesma data, **então** o sistema bloqueia a criação e sugere editar o roteiro existente.
- **Dado** que nenhum ponto foi selecionado, **quando** o Supervisor local tenta salvar o roteiro, **então** o sistema impede o salvamento e informa que é necessário ao menos um ponto.

#### 10. Requisitos não funcionais relevantes
- RNF01 — persistência garantindo histórico completo.

#### 11. Questões em aberto
A especificação não define um número mínimo de pontos por roteiro além de implicitamente "ao menos um" (o ponto de partida). Assumido 1 como mínimo — decisão de implementação, não uma questão de negócio que exija validação do cliente.


![UC09 — diagrama de robustez](../diagramas/cenarios/C3-planejamento-do-dia/UC09-robustez.png)


### UC10 — Consultar roteiro do dia

#### 1. Cabeçalho
- **ID:** UC10
- **Nome:** Consultar roteiro do dia
- **Cenário(s):** C3 — Planejamento do dia (pré-requisito do cenário C4)
- **Ator principal:** Entregador
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** Decorrente de RF04/RF05 — requisito implícito, sem RF direto na especificação (RF04 cobre a montagem do roteiro, não a consulta; a consulta é necessária para o Entregador executar `UC11`–`UC14` do cenário C4).

#### 2. Objetivo
Como Entregador, quero consultar meu roteiro do dia para saber quais pontos visitar e em que ordem.

#### 3. Pré-condições e gatilho
**Pré-condições:** Entregador autenticado.
**Gatilho:** Entregador acessa a tela inicial do aplicativo no dia.

#### 4. Fluxo principal
1. Entregador acessa a tela "Meu roteiro do dia".
2. Sistema busca o Roteiro do Entregador autenticado para a data corrente.
3. Sistema exibe os pontos do roteiro em ordem sequencial (RN06), com endereço, ordem e status de cada um (pendente/concluído).

#### 5. Fluxos alternativos e de exceção
- **2a. Não existe roteiro para a data corrente:** sistema exibe "Nenhum roteiro disponível para hoje".

#### 6. Pós-condições
- **Sucesso:** roteiro do dia exibido ao Entregador.
- **Falha:** mensagem de ausência de roteiro exibida; nenhum dado alterado.

#### 7. Regras de negócio aplicadas
- **RN06** (passo 3): exibição respeita a ordem sequencial definida na montagem do roteiro.

#### 8. Dados
- **Leitura:** `Roteiro` (do Entregador autenticado, filtrando por `entregadorId` e data corrente), `Ponto` (endereço, ordem, status).

#### 9. Critérios de aceitação
- **Dado** que existe um roteiro montado para a entregadora Maria na data de hoje com 4 pontos, **quando** ela acessa "Meu roteiro do dia", **então** o sistema exibe os 4 pontos na ordem sequencial definida.
- **Dado** que não existe roteiro montado para o Entregador hoje, **quando** ele acessa a tela, **então** o sistema exibe "Nenhum roteiro disponível para hoje".

#### 10. Requisitos não funcionais relevantes
- RNF02 — interface responsiva/mobile: é a tela principal usada pelo Entregador em campo.

#### 11. Questões em aberto
Nenhuma.


![UC10 — diagrama de robustez](../diagramas/cenarios/C3-planejamento-do-dia/UC10-robustez.png)


### C4 — Entregador sai para fazer entregas

#### Objetivo do cenário
Cobrir a execução do roteiro diário em campo: o entregador inicia o roteiro, registra chegada e saída em cada ponto, finaliza o roteiro e o sistema calcula automaticamente o tempo parado e o custo estimado.

#### Atores
- **Entregador** (ator principal de UC11–UC14).
- **Sistema** (ator dos casos de uso incluídos UC15 e UC23, sem interação humana direta).

#### Casos de uso do cenário
| UC | Nome | Rastreio |
|---|---|---|
| UC11 | Iniciar roteiro | RN01 |
| UC12 | Registrar chegada no ponto | RF05 |
| UC13 | Registrar saída do ponto | RF05 |
| UC14 | Finalizar roteiro | RF06, RN03 |
| UC15 | Calcular tempo parado (sistema, `«include»` de UC13 e UC14) | RF06, RN01, RN02, RN03 |
| UC23 | Calcular distância e custo do roteiro (sistema, `«include»` de UC14) | RF11, RN07 |

#### Pré-condições gerais do cenário
- Entregador autenticado (UC00), pertencente a uma Unidade de um Estabelecimento.
- Existe um Roteiro montado (UC09) para o Entregador na data corrente, com Pontos em ordem sequencial (RN06) e coordenadas cadastradas (RF03).
- Parâmetros de custo (UC03) e rendimento km/litro do Entregador (UC06) cadastrados.

#### Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml).

#### Decisões aplicadas neste cenário
- [ADR-002](../../decisoes/ADR-002-distancia-haversine.md) — distância calculada pelo sistema.
- [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md) — rendimento km/litro é atributo do Entregador.
- [ADR-007](../../decisoes/ADR-007-calculo-custo-roteiro-uc-dedicado.md) — UC15 e UC23 como casos de uso de sistema dedicados a cálculo, incluídos por UC13/UC14.


![Diagrama de casos de uso — C4-entregador-sai-para-fazer-entregas](../diagramas/cenarios/C4-entregador-sai-para-fazer-entregas/C4-casos-de-uso.png)


### UC11 — Iniciar roteiro

#### 1. Cabeçalho
- **ID:** UC11
- **Nome:** Iniciar roteiro
- **Cenário(s):** C4 — Entregador sai para fazer entregas
- **Ator principal:** Entregador
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RN01

#### 2. Objetivo
Como Entregador, quero iniciar meu roteiro do dia para começar o registro de execução das entregas.

#### 3. Pré-condições e gatilho
**Pré-condições:** Entregador autenticado; existe Roteiro montado (UC09) para o Entregador na data corrente, com status "Não iniciado".
**Gatilho:** Entregador aciona "Iniciar roteiro" na tela do roteiro do dia (UC10).

#### 4. Fluxo principal
1. Entregador acessa a tela do roteiro do dia.
2. Sistema exibe os pontos do roteiro em ordem sequencial (RN06), com endereço e ordem.
3. Entregador seleciona "Iniciar roteiro".
4. Sistema registra o horário de início do roteiro e marca o ponto de partida (ordem 1) como visitado, sem contabilizar tempo parado para ele (RN01).
5. Sistema atualiza o status do roteiro para "Em andamento" e libera o registro de chegada no próximo ponto.

#### 5. Fluxos alternativos e de exceção
- **3a. Roteiro já iniciado:** sistema informa que o roteiro já está em andamento e exibe o próximo ponto pendente, sem duplicar o início.
- **3b. Não existe roteiro montado para a data corrente:** sistema exibe "Nenhum roteiro disponível para hoje" e a ação "Iniciar roteiro" fica indisponível.

#### 6. Pós-condições
- **Sucesso:** Roteiro com status "Em andamento", horário de início registrado, ponto de partida marcado sem tempo parado.
- **Falha:** nenhum estado alterado; roteiro permanece no status anterior.

#### 7. Regras de negócio aplicadas
- **RN01** (passo 4): o ponto de partida não conta tempo parado.
- **RN06** (passo 2): pontos exibidos na ordem sequencial definida na montagem do roteiro.

#### 8. Dados
- **Leitura:** `Roteiro` (id, data, entregadorId, unidadeId, status, pontos ordenados).
- **Escrita:** `Roteiro.horaInicio` (datetime), `Roteiro.status` (enum: `NaoIniciado`|`EmAndamento`|`Finalizado`).

#### 9. Critérios de aceitação
- **Dado** um roteiro montado para o entregador João, unidade Centro, na data de hoje, com 4 pontos, **quando** ele inicia o roteiro, **então** o status muda para "Em andamento", o horário de início é registrado e o ponto 1 não recebe tempo parado.
- **Dado** um roteiro já em andamento, **quando** o entregador tenta iniciar novamente, **então** o sistema mantém o estado atual e informa que o roteiro já foi iniciado.
- **Dado** que não há roteiro montado para hoje, **quando** o entregador acessa a tela do roteiro do dia, **então** o sistema exibe "Nenhum roteiro disponível para hoje" e a ação iniciar roteiro fica indisponível.

#### 10. Requisitos não funcionais relevantes
- RNF02 — interface responsiva, pois o Entregador acessa via dispositivo móvel em campo.

#### 11. Questões em aberto
- A especificação não define se há restrição de horário para iniciar o roteiro (ex.: fora da jornada padrão). Assumido que o sistema permite iniciar a qualquer momento do dia da data do roteiro.


![UC11 — diagrama de robustez](../diagramas/cenarios/C4-entregador-sai-para-fazer-entregas/UC11-robustez.png)


### UC12 — Registrar chegada no ponto

#### 1. Cabeçalho
- **ID:** UC12
- **Nome:** Registrar chegada no ponto
- **Cenário(s):** C4 — Entregador sai para fazer entregas
- **Ator principal:** Entregador
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF05

#### 2. Objetivo
Como Entregador, quero registrar minha chegada no ponto atual do roteiro para iniciar a contagem do tempo parado.

#### 3. Pré-condições e gatilho
**Pré-condições:** Roteiro em status "Em andamento"; o ponto é o próximo da sequência ainda não visitado (RN06).
**Gatilho:** Entregador chega fisicamente ao ponto e aciona "Registrar chegada".

#### 4. Fluxo principal
1. Entregador acessa a tela de registro do ponto atual.
2. Sistema exibe o ponto esperado (endereço, ordem), conforme RN06.
3. Entregador confirma "Registrar chegada".
4. Sistema grava a data/hora de chegada no ponto corrente.
5. Sistema atualiza o status do ponto para "Aguardando saída".

#### 5. Fluxos alternativos e de exceção
- **3a. Tentativa de registrar chegada em ponto fora de ordem:** sistema bloqueia e informa qual é o próximo ponto esperado (RN06).
- **4a. Chegada já registrada para este ponto:** sistema informa que a chegada já foi registrada e não permite duplicar.

#### 6. Pós-condições
- **Sucesso:** `Ponto.horaChegada` preenchido; status do ponto "Aguardando saída".
- **Falha:** nenhuma alteração no ponto.

#### 7. Regras de negócio aplicadas
- **RN06** (passos 2 e 3a): pontos só podem ser registrados na ordem sequencial definida no roteiro.

#### 8. Dados
- **Leitura:** `Roteiro.pontos` (ordem, status de cada ponto).
- **Escrita:** `Ponto.horaChegada` (datetime), `Ponto.status` (enum: `Pendente`|`AguardandoSaida`|`Concluido`).

#### 9. Critérios de aceitação
- **Dado** o roteiro da entregadora Maria em andamento, com o ponto 2 (Rua Peru, 55) como próximo pendente, **quando** ela registra a chegada às 09:15, **então** o sistema grava `horaChegada = 09:15` no ponto 2 e muda seu status para "Aguardando saída".
- **Dado** que o ponto 3 ainda não é o próximo esperado (ponto 2 pendente), **quando** o entregador tenta registrar chegada no ponto 3, **então** o sistema bloqueia e informa que o próximo ponto esperado é o 2.
- **Dado** que a chegada no ponto 2 já foi registrada, **quando** o entregador tenta registrar novamente, **então** o sistema informa que já existe um registro de chegada para esse ponto.

#### 10. Requisitos não funcionais relevantes
- RNF01 — persistência garantindo histórico completo.
- RNF02 — interface responsiva/mobile.

#### 11. Questões em aberto
- A especificação não define validação de geolocalização (o sistema confirmar que o entregador está fisicamente no endereço do ponto). Assumido registro por confirmação manual, sem validação de GPS — telemetria em tempo real está fora do escopo (seção 3.2 da especificação).


![UC12 — diagrama de robustez](../diagramas/cenarios/C4-entregador-sai-para-fazer-entregas/UC12-robustez.png)


### UC13 — Registrar saída do ponto

#### 1. Cabeçalho
- **ID:** UC13
- **Nome:** Registrar saída do ponto
- **Cenário(s):** C4 — Entregador sai para fazer entregas
- **Ator principal:** Entregador
- **Atores secundários:** Sistema (via `«include»` de UC15)
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF05

#### 2. Objetivo
Como Entregador, quero registrar minha saída do ponto atual para que o sistema calcule o tempo que fiquei parado ali.

#### 3. Pré-condições e gatilho
**Pré-condições:** Ponto atual com `horaChegada` registrada (UC12) e sem `horaSaida`.
**Gatilho:** Entregador está de saída do ponto e aciona "Registrar saída".

#### 4. Fluxo principal
1. Entregador acessa a tela do ponto atual (com chegada já registrada).
2. Entregador confirma "Registrar saída".
3. Sistema grava a data/hora de saída do ponto.
4. Sistema inclui **UC15 Calcular tempo parado** para calcular o tempo parado deste ponto (RN02), aplicando a exclusão do ponto de partida quando cabível (RN01).
5. Sistema atualiza o status do ponto para "Concluído" e libera o próximo ponto da sequência (RN06).

#### 5. Fluxos alternativos e de exceção
- **2a. Saída já registrada:** sistema informa e não duplica o registro.
- **2b. Chegada ainda não registrada neste ponto:** sistema bloqueia o registro de saída e solicita registrar a chegada primeiro.

#### 6. Pós-condições
- **Sucesso:** `Ponto.horaSaida` preenchido; `Ponto.tempoParado` calculado (exceto ponto de partida); status "Concluído".
- **Falha:** nenhuma alteração.

#### 7. Regras de negócio aplicadas
- **RN01** (passo 4, via UC15): ponto de partida não recebe tempo parado.
- **RN02** (passo 4, via UC15): tempo parado = horaSaida − horaChegada.
- **RN06** (passo 5): liberação do próximo ponto conforme ordem sequencial.

#### 8. Dados
- **Leitura:** `Ponto.horaChegada`, `Ponto.ordem`.
- **Escrita:** `Ponto.horaSaida` (datetime), `Ponto.tempoParado` (derivado, via UC15), `Ponto.status`.

#### 9. Critérios de aceitação
- **Dado** o ponto 2 com chegada às 09:15, **quando** o entregador registra saída às 09:30, **então** o sistema grava `horaSaida = 09:30` e calcula `tempoParado = 15 min` para o ponto 2.
- **Dado** o ponto 1 (partida), **quando** o entregador registra sua saída, **então** o sistema grava `horaSaida` mas não contabiliza `tempoParado` (RN01).
- **Dado** que a chegada no ponto 3 ainda não foi registrada, **quando** o entregador tenta registrar a saída, **então** o sistema bloqueia e solicita o registro de chegada primeiro.

#### 10. Requisitos não funcionais relevantes
- RNF01 — persistência garantindo histórico completo.
- RNF02 — interface responsiva/mobile.

#### 11. Questões em aberto
Nenhuma além das já registradas em UC12.


![UC13 — diagrama de robustez](../diagramas/cenarios/C4-entregador-sai-para-fazer-entregas/UC13-robustez.png)


### UC14 — Finalizar roteiro

#### 1. Cabeçalho
- **ID:** UC14
- **Nome:** Finalizar roteiro
- **Cenário(s):** C4 — Entregador sai para fazer entregas
- **Ator principal:** Entregador
- **Atores secundários:** Sistema (via `«include»` de UC15 e UC23)
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF06, RN03 (ver [ADR-011](../../decisoes/ADR-011-finalizacao-exige-todos-pontos.md))

#### 2. Objetivo
Como Entregador, quero finalizar meu roteiro ao concluir todas as entregas, para que o sistema calcule o tempo total parado e o custo do trajeto.

#### 3. Pré-condições e gatilho
**Pré-condições:** Roteiro em status "Em andamento".
**Gatilho:** Entregador registra a saída do último ponto do roteiro, ou aciona "Finalizar roteiro" manualmente.

#### 4. Fluxo principal
1. Entregador registra a saída do último ponto do roteiro (UC13) ou aciona "Finalizar roteiro".
2. Sistema verifica que todos os pontos da sequência têm saída registrada (RN06). Finalização com pontos pendentes não é permitida ([ADR-011](../../decisoes/ADR-011-finalizacao-exige-todos-pontos.md)).
3. Sistema inclui **UC15 Calcular tempo parado** (modo total) para somar o tempo parado de todos os pontos, exceto o de partida (RN03).
4. Sistema inclui **UC23 Calcular distância e custo do roteiro** para computar a distância percorrida e o custo estimado (RN07).
5. Sistema grava o horário de término, o tempo total parado, a distância total e o custo estimado no roteiro, e atualiza o status para "Finalizado".
6. Sistema exibe ao Entregador um resumo do roteiro concluído.

#### 5. Fluxos alternativos e de exceção
- **1a. Entregador aciona "Finalizar roteiro" com pontos pendentes:** sistema bloqueia a finalização e informa quais pontos ainda não têm saída registrada ([ADR-011](../../decisoes/ADR-011-finalizacao-exige-todos-pontos.md)). Não há finalização parcial.
- **5a. Roteiro já finalizado:** sistema informa e exibe o resumo já calculado, sem recalcular.

#### 6. Pós-condições
- **Sucesso:** `Roteiro.status = Finalizado`, `horaTermino`, `tempoTotalParado`, `distanciaTotal`, `custoEstimado` preenchidos.
- **Falha:** roteiro permanece "Em andamento".

#### 7. Regras de negócio aplicadas
- **RN03** (passo 3, via UC15): tempo total parado = soma dos tempos parados de todos os pontos, exceto o de partida.
- **RN06** (passo 2): verificação de que todos os pontos da sequência foram visitados.
- **RN07** (passo 4, via UC23): custo do trajeto a partir de combustível, rendimento km/litro e distância.

#### 8. Dados
- **Leitura:** `Roteiro.pontos` (todos, com `tempoParado` individual e coordenadas).
- **Escrita:** `Roteiro.tempoTotalParado`, `Roteiro.distanciaTotal`, `Roteiro.custoEstimado`, `Roteiro.horaTermino`, `Roteiro.status`.

#### 9. Critérios de aceitação
- **Dado** o roteiro A com pontos 2, 3 e 4 com tempos parados de 15, 10 e 50 minutos, **quando** o entregador registra a saída do último ponto, **então** o sistema finaliza o roteiro com `tempoTotalParado = 75 min`.
- **Dado** um roteiro com distância total calculada de 42 km, combustível a R$ 6,00/L e rendimento de 12 km/L, **quando** o roteiro é finalizado, **então** o sistema calcula `custoEstimado = (42 ÷ 12) × 6,00 = R$ 21,00`.
- **Dado** um roteiro já finalizado, **quando** o entregador tenta finalizá-lo novamente, **então** o sistema exibe o resumo já calculado sem reprocessar.

#### 10. Requisitos não funcionais relevantes
- RNF01 — persistência garantindo histórico completo do roteiro.

#### 11. Questões em aberto
Nenhuma — resolvida via [ADR-011](../../decisoes/ADR-011-finalizacao-exige-todos-pontos.md). Retomada/cancelamento de um roteiro incompleto em outro dia está fora do escopo do MVP.


![UC14 — diagrama de robustez](../diagramas/cenarios/C4-entregador-sai-para-fazer-entregas/UC14-robustez.png)


### UC15 — Calcular tempo parado

#### 1. Cabeçalho
- **ID:** UC15
- **Nome:** Calcular tempo parado
- **Cenário(s):** C4 — Entregador sai para fazer entregas
- **Ator principal:** Sistema
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF06, RN01, RN02, RN03

#### 2. Objetivo
Como Sistema, quero calcular o tempo parado de um ponto (ao registrar saída) ou o tempo total parado do roteiro (ao finalizar), aplicando a regra de exclusão do ponto de partida.

#### 3. Pré-condições e gatilho
**Pré-condições:** caso de uso executado exclusivamente por `«include»`, nunca acionado diretamente por um ator humano.
**Gatilho:** inclusão por UC13 Registrar saída do ponto (modo "por ponto") ou por UC14 Finalizar roteiro (modo "total do roteiro").

#### 4. Fluxo principal

**Modo "por ponto" (disparado por UC13):**
1. Sistema verifica se o ponto é o ponto de partida (ordem = 1).
2. Se não for o ponto de partida, sistema calcula `tempoParado = horaSaida − horaChegada` (RN02).
3. Sistema retorna o valor calculado para UC13 gravar no ponto.

**Modo "total do roteiro" (disparado por UC14):**
1. Sistema percorre todos os pontos do roteiro, exceto o de partida.
2. Sistema soma os valores de `tempoParado` de cada ponto (RN03).
3. Sistema retorna o total para UC14 gravar no roteiro.

#### 5. Fluxos alternativos e de exceção
- **1a (modo por ponto). Ponto é o de partida:** sistema retorna `tempoParado = não aplicável`, sem cálculo e sem entrar na soma total (RN01).

#### 6. Pós-condições
- **Sucesso:** valor de tempo parado (por ponto ou total) retornado corretamente ao caso de uso que incluiu UC15.
- **Falha:** não se aplica — caso de uso de sistema, sem interação de exceção com usuário.

#### 7. Regras de negócio aplicadas
- **RN01** (passo 1/1a, modo por ponto): ponto de partida não conta tempo parado.
- **RN02** (passo 2, modo por ponto): tempo parado = saída − chegada.
- **RN03** (passo 2, modo total): soma dos tempos parados, exceto o ponto de partida.

#### 8. Dados
- **Leitura:** `Ponto.horaChegada`, `Ponto.horaSaida`, `Ponto.ordem` (modo por ponto); `Roteiro.pontos` (modo total).
- **Escrita:** nenhuma diretamente — retorna o valor calculado para o caso de uso incluidor gravar.

#### 9. Critérios de aceitação
- **Dado** um ponto com `horaChegada = 09:15` e `horaSaida = 09:30`, **quando** o sistema calcula o tempo parado, **então** retorna 15 minutos.
- **Dado** o ponto de partida (ordem = 1), **quando** o sistema calcula o tempo parado, **então** retorna não aplicável, sem contar no total.
- **Dado** um roteiro com pontos 2, 3 e 4 com tempos parados de 15, 10 e 50 minutos, **quando** o sistema soma o tempo total, **então** retorna 75 minutos.

#### 10. Requisitos não funcionais relevantes
Nenhum diretamente — caso de uso de sistema sem interface.

#### 11. Questões em aberto
Nenhuma.


![UC15 — diagrama de robustez](../diagramas/cenarios/C4-entregador-sai-para-fazer-entregas/UC15-robustez.png)


### UC23 — Calcular distância e custo do roteiro

#### 1. Cabeçalho
- **ID:** UC23
- **Nome:** Calcular distância e custo do roteiro
- **Cenário(s):** C4 — Entregador sai para fazer entregas
- **Ator principal:** Sistema
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Should
- **Rastreio:** RF11, RN07 (ver [ADR-002](../../decisoes/ADR-002-distancia-haversine.md), [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md), [ADR-007](../../decisoes/ADR-007-calculo-custo-roteiro-uc-dedicado.md))

#### 2. Objetivo
Como Sistema, quero calcular a distância total percorrida no roteiro e o custo estimado, a partir das coordenadas dos pontos, dos parâmetros de custo e do rendimento do veículo do Entregador.

#### 3. Pré-condições e gatilho
**Pré-condições:** roteiro com todos os pontos com latitude/longitude cadastrados — garantido estruturalmente por [ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md), já que `UC07` exige coordenadas obrigatórias; parâmetros de custo cadastrados (UC03); rendimento km/litro do Entregador cadastrado (UC06).
**Gatilho:** inclusão por UC14 Finalizar roteiro.

#### 4. Fluxo principal
1. Sistema obtém a lista ordenada de pontos do roteiro com suas coordenadas (RN06).
2. Sistema calcula a distância entre cada par de pontos consecutivos usando a fórmula de Haversine e soma os valores para obter a distância total.
3. Sistema obtém o rendimento km/litro do veículo do Entregador (UC06) e o valor do combustível parametrizado (UC03).
4. Sistema calcula o custo estimado = (distância total ÷ rendimento km/litro) × valor do combustível (RN07).
5. Sistema retorna distância total e custo estimado para UC14 gravar no roteiro.

#### 5. Fluxos alternativos e de exceção
Nenhum — todo Ponto elegível para um Roteiro já possui coordenadas válidas ([ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md)), eliminando estruturalmente o caso de dado ausente.

#### 6. Pós-condições
- **Sucesso:** `distanciaTotal` e `custoEstimado` calculados e retornados para UC14.
- **Falha:** cálculo não realizado; UC14 não consegue gravar os totais completos.

#### 7. Regras de negócio aplicadas
- **RN06** (passo 1): pontos processados na ordem sequencial do roteiro.
- **RN07** (passo 4): custo = combustível × rendimento km/litro × distância percorrida.

#### 8. Dados
- **Leitura:** `Ponto.latitude`, `Ponto.longitude`, `Ponto.ordem`; `Entregador.rendimentoKmLitro`; `Parametro.valorCombustivel`.
- **Escrita:** `Roteiro.distanciaTotal`, `Roteiro.custoEstimado` (via retorno para UC14).

#### 9. Critérios de aceitação
- **Dado** um roteiro com 4 pontos com coordenadas cadastradas, cuja soma das distâncias consecutivas pela fórmula de Haversine é 42 km, **quando** o sistema calcula a distância, **então** `distanciaTotal = 42 km`.
- **Dado** rendimento do veículo = 12 km/L e valor do combustível = R$ 6,00, **quando** o sistema calcula o custo para 42 km percorridos, **então** `custoEstimado = (42 ÷ 12) × 6,00 = R$ 21,00`.

#### 10. Requisitos não funcionais relevantes
Depende indiretamente de RF03 (pontos com coordenadas) e RF09 (parâmetros de custo) estarem corretamente cadastrados.

#### 11. Questões em aberto
Nenhuma — resolvidas via [ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md) (coordenadas obrigatórias) e [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md)/[ADR-007](../../decisoes/ADR-007-calculo-custo-roteiro-uc-dedicado.md) ("custo por km" é indicador derivado, não fórmula alternativa).


![UC23 — diagrama de robustez](../diagramas/cenarios/C4-entregador-sai-para-fazer-entregas/UC23-robustez.png)


### C5 — Correção de registros

#### Objetivo do cenário
Permitir que o Supervisor local corrija erros de registro de horário de chegada/saída em pontos do roteiro, com auditoria obrigatória e recálculo automático dos indicadores derivados, e consulte o histórico dessas correções.

#### Atores
- **Supervisor local** (ator principal de UC16 e UC17).
- **Sistema** (recalcula tempo parado via `UC15`, cenário C4, incluído por UC16 quando aplicável).

#### Casos de uso do cenário
| UC | Nome | Rastreio |
|---|---|---|
| UC16 | Corrigir horário de chegada/saída (gera auditoria) | RNF05 |
| UC17 | Consultar trilha de auditoria | RNF05 |

#### Pré-condições gerais do cenário
- Supervisor local autenticado (UC00), atuando sobre sua própria Unidade (isolamento por Unidade/Estabelecimento, [constituição](../../constituicao.md) itens 1–2).
- Existe um Ponto já registrado (com `horaChegada` e, opcionalmente, `horaSaida`) pertencente a um Roteiro da Unidade do Supervisor.

#### Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml).

#### Decisões aplicadas neste cenário
- [Constituição, item 4](../../constituicao.md) — auditoria obrigatória de toda alteração manual em registro de tempo.
- [ADR-011](../../decisoes/ADR-011-finalizacao-exige-todos-pontos.md) — Roteiro finalizado não reabre para novos registros de chegada/saída; correção via UC16 é a única forma de alterar horários após a finalização.
- [ADR-013](../../decisoes/ADR-013-recalculo-em-correcao.md) — correção recalcula tempo parado do ponto e, se o roteiro já estava finalizado, o total do roteiro, reaproveitando UC15 (cenário C4).


![Diagrama de casos de uso — C5-correcao-de-registros](../diagramas/cenarios/C5-correcao-de-registros/C5-casos-de-uso.png)


### UC16 — Corrigir horário de chegada/saída

#### 1. Cabeçalho
- **ID:** UC16
- **Nome:** Corrigir horário de chegada/saída
- **Cenário(s):** C5 — Correção de registros
- **Ator principal:** Supervisor local
- **Atores secundários:** Sistema (via `«include»` de UC15, cenário C4)
- **Prioridade (MoSCoW):** Should
- **Rastreio:** RNF05 (ver [ADR-013](../../decisoes/ADR-013-recalculo-em-correcao.md))

#### 2. Objetivo
Como Supervisor local, quero corrigir um horário de chegada ou saída registrado incorretamente por um Entregador, mantendo um registro auditável da alteração.

#### 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado, atuando sobre a Unidade dona do Ponto; o Ponto possui `horaChegada` registrada (correção de saída exige também `horaSaida` já registrada).
**Gatilho:** Supervisor local identifica um horário incorreto (ex.: falha de conectividade no momento do registro original) e aciona "Corrigir horário" na tela do ponto.

#### 4. Fluxo principal
1. Supervisor local seleciona o Ponto a corrigir e o campo (`horaChegada` ou `horaSaida`).
2. Sistema exibe o valor atual do campo.
3. Supervisor local informa o novo valor e uma justificativa obrigatória para a correção.
4. Sistema valida o novo valor (ver seção 8).
5. Sistema grava o novo valor no Ponto e cria um registro de Auditoria (autor, data/hora da correção, campo alterado, valor anterior, valor novo, justificativa).
6. Sistema inclui **UC15 Calcular tempo parado** (modo por ponto) para recalcular `tempoParado` do ponto corrigido.
7. Se o Roteiro do ponto está com status "Finalizado", sistema inclui **UC15** (modo total) para recalcular `tempoTotalParado` do roteiro ([ADR-013](../../decisoes/ADR-013-recalculo-em-correcao.md)).
8. Sistema exibe confirmação da correção ao Supervisor local.

#### 5. Fluxos alternativos e de exceção
- **3a. Justificativa não informada:** sistema bloqueia o envio e exige preenchimento da justificativa.
- **4a. Novo valor tornaria `horaSaida` anterior ou igual a `horaChegada`:** sistema rejeita a correção e exibe mensagem de validação, sem gravar nada.
- **4b. Ponto é o ponto de partida (ordem 1):** correção de horário é permitida (para fins de registro), mas não gera `tempoParado`, conforme RN01.

#### 6. Pós-condições
- **Sucesso:** `Ponto.horaChegada`/`Ponto.horaSaida` atualizado, `Ponto.tempoParado` recalculado, registro de `Auditoria` criado e, se aplicável, `Roteiro.tempoTotalParado` atualizado.
- **Falha:** nenhuma alteração no Ponto, no Roteiro nem na Auditoria.

#### 7. Regras de negócio aplicadas
- **RN01** (passo 6/4b): ponto de partida não recebe tempo parado, mesmo após correção.
- **RN02** (passo 6): tempo parado recalculado = nova saída − nova chegada.
- **RN03** (passo 7): tempo total parado recalculado quando o roteiro já está finalizado.

#### 8. Dados
- **Leitura:** `Ponto.horaChegada`, `Ponto.horaSaida`, `Ponto.ordem`, `Roteiro.status`.
- **Escrita:** `Ponto.horaChegada` ou `Ponto.horaSaida` (datetime), `Ponto.tempoParado` (recalculado), `Roteiro.tempoTotalParado` (recalculado, se roteiro finalizado), `Auditoria` (novo registro: `autorId`, `dataHoraCorrecao`, `entidade = Ponto`, `campo`, `valorAnterior`, `valorNovo`, `justificativa`).
- **Validação:** `horaSaida > horaChegada` sempre que ambas estiverem presentes; justificativa é campo obrigatório (texto não vazio).

#### 9. Critérios de aceitação
- **Dado** um ponto com `horaChegada = 09:15` e `horaSaida = 09:30` (tempoParado = 15 min), **quando** o Supervisor local corrige `horaSaida` para 09:45 com justificativa "registro original com falha de GPS", **então** o sistema grava o novo valor, recalcula `tempoParado = 30 min` e cria um registro de auditoria com os valores 09:30 → 09:45.
- **Dado** uma tentativa de correção sem justificativa, **quando** o Supervisor local tenta salvar, **então** o sistema bloqueia e exige a justificativa.
- **Dado** uma correção que resultaria em `horaSaida` (09:00) anterior à `horaChegada` (09:15), **quando** o Supervisor local tenta salvar, **então** o sistema rejeita a correção e nenhuma alteração é persistida.
- **Dado** um Roteiro já "Finalizado" com `tempoTotalParado = 75 min`, **quando** um de seus pontos tem o tempo parado corrigido de 15 para 30 minutos, **então** o sistema recalcula `tempoTotalParado = 90 min`, mantendo o Roteiro "Finalizado".

#### 10. Requisitos não funcionais relevantes
- RNF05 — toda alteração gera registro de auditoria imutável (não editável, não removível).
- RNF01 — persistência com histórico completo (valor anterior nunca é descartado).

#### 11. Questões em aberto
Nenhuma — recálculo em cascata resolvido em [ADR-013](../../decisoes/ADR-013-recalculo-em-correcao.md).


![UC16 — diagrama de robustez](../diagramas/cenarios/C5-correcao-de-registros/UC16-robustez.png)


### UC17 — Consultar trilha de auditoria

#### 1. Cabeçalho
- **ID:** UC17
- **Nome:** Consultar trilha de auditoria
- **Cenário(s):** C5 — Correção de registros
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Could
- **Rastreio:** RNF05

#### 2. Objetivo
Como Supervisor local, quero consultar o histórico de correções manuais feitas em registros da minha Unidade, para auditar quem alterou o quê e por quê.

#### 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado; existem registros de Auditoria gerados por UC16 na sua Unidade.
**Gatilho:** Supervisor local acessa a tela "Trilha de auditoria".

#### 4. Fluxo principal
1. Supervisor local acessa a tela de trilha de auditoria.
2. Supervisor local informa um filtro de período (data inicial e final).
3. Sistema busca os registros de Auditoria da Unidade do Supervisor local dentro do período informado.
4. Sistema exibe a lista ordenada por data/hora decrescente, com autor, ponto/roteiro afetado, campo alterado, valor anterior, valor novo e justificativa.

#### 5. Fluxos alternativos e de exceção
- **3a. Nenhum registro de auditoria no período:** sistema exibe lista vazia com mensagem "Nenhuma correção registrada no período".
- **2a. Período não informado:** sistema aplica um período padrão (últimos 30 dias).

#### 6. Pós-condições
- **Sucesso:** lista de registros de Auditoria exibida, restrita à Unidade do Supervisor local.
- **Falha:** não se aplica (consulta somente leitura).

#### 7. Regras de negócio aplicadas
Nenhuma RN diretamente; aplica o princípio de isolamento por Unidade ([constituição](../../constituicao.md), item 2).

#### 8. Dados
- **Leitura:** `Auditoria` (autorId, dataHoraCorrecao, entidade, campo, valorAnterior, valorNovo, justificativa, unidadeId).

#### 9. Critérios de aceitação
- **Dado** que existem 3 correções registradas na Unidade Centro no último mês, **quando** o Supervisor local dessa Unidade consulta a trilha de auditoria do período, **então** o sistema exibe as 3 correções, mais recente primeiro.
- **Dado** que uma correção foi feita em outra Unidade, **quando** o Supervisor local consulta a trilha de auditoria, **então** essa correção não aparece na lista (isolamento por Unidade).
- **Dado** nenhum filtro de período informado, **quando** o Supervisor local acessa a tela, **então** o sistema exibe as correções dos últimos 30 dias por padrão.

#### 10. Requisitos não funcionais relevantes
- RNF05 — trilha de auditoria completa e imutável.
- RNF03 (por analogia ao dashboard) — consulta deve responder em tempo hábil mesmo com histórico extenso; sem exigência numérica explícita da especificação para este UC.

#### 11. Questões em aberto
Nenhuma.


![UC17 — diagrama de robustez](../diagramas/cenarios/C5-correcao-de-registros/UC17-robustez.png)


### C6 — Acompanhamento e análise

#### Objetivo do cenário
Permitir que o Supervisor acompanhe o desempenho operacional da sua Unidade (tempo parado, custos, histórico) através de um dashboard e consultas detalhadas, e que o Entregador consulte o próprio histórico. Cobre a exportação de relatórios para uso fora do sistema.

#### Atores
- **Supervisor local** (ator principal de UC18–UC21).
- **Entregador** (ator principal de UC22).

#### Casos de uso do cenário
| UC | Nome | Rastreio |
|---|---|---|
| UC18 | Visualizar dashboard de tempo parado (dia/mês/período) | RF08, RNF03 |
| UC19 | Consultar histórico de pontos e tempos com endereços | RF07 |
| UC20 | Consultar custo estimado do roteiro | RF11 |
| UC21 | Exportar relatório — `«extend»` de UC18 e UC19 | RF12 |
| UC22 | Consultar o próprio histórico | RF07, RNF06 |

#### Pré-condições gerais do cenário
- Ator autenticado (UC00), pertencente a uma Unidade de um Estabelecimento.
- Existem Roteiros finalizados (UC14, cenário C4) com tempo parado, distância e custo calculados (UC15, UC23) para consulta.

#### Diagrama de casos de uso
Ver [`casos-de-uso.puml`](casos-de-uso.puml).

#### Decisões aplicadas neste cenário
- [ADR-003](../../decisoes/ADR-003-historico-entregador.md) — Entregador só consulta o próprio histórico (UC22).
- [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md) e [ADR-007](../../decisoes/ADR-007-calculo-custo-roteiro-uc-dedicado.md) — UC20 é uma consulta ao custo já calculado por UC23 (cenário C4); não recalcula.
- Formato de exportação de UC21 decidido como CSV (ver spec do UC21) por simplicidade de implementação no MVP, sem necessidade de biblioteca de geração de PDF.


![Diagrama de casos de uso — C6-acompanhamento-e-analise](../diagramas/cenarios/C6-acompanhamento-e-analise/C6-casos-de-uso.png)


### UC18 — Visualizar dashboard de tempo parado (dia/mês/período)

#### 1. Cabeçalho
- **ID:** UC18
- **Nome:** Visualizar dashboard de tempo parado (dia/mês/período)
- **Cenário(s):** C6 — Acompanhamento e análise
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF08, RNF03

#### 2. Objetivo
Como Supervisor local, quero visualizar gráficos de tempo parado por dia, mês e período para identificar gargalos na operação da minha Unidade.

#### 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado; existem Roteiros finalizados na Unidade com `tempoTotalParado` calculado (UC14/UC15, cenário C4).
**Gatilho:** Supervisor local acessa a tela de dashboard.

#### 4. Fluxo principal
1. Supervisor local acessa a tela de dashboard.
2. Sistema exibe, por padrão, o recorte "dia" (data corrente) com o tempo parado agregado por Entregador/Roteiro da Unidade.
3. Supervisor local seleciona o recorte desejado: dia, mês ou período (intervalo de datas).
4. Sistema consulta os Roteiros finalizados da Unidade no recorte selecionado e agrega o tempo parado.
5. Sistema exibe o gráfico correspondente, junto de um resumo numérico (total e média de tempo parado no recorte).

#### 5. Fluxos alternativos e de exceção
- **3a. Recorte "período" com data final anterior à inicial:** sistema bloqueia a consulta e solicita um intervalo válido.
- **4a. Nenhum roteiro finalizado no recorte selecionado:** sistema exibe o gráfico vazio com a mensagem "Nenhum dado disponível para o período selecionado".

#### 6. Pós-condições
- **Sucesso:** gráfico e resumo exibidos para o recorte selecionado.
- **Falha:** nenhum dado exibido; recorte anterior permanece na tela.

#### 7. Regras de negócio aplicadas
- Nenhuma RN de negócio diretamente aplicável — o cálculo de tempo parado já foi feito por UC15 (RN01–RN03); este UC apenas agrega e exibe.

#### 8. Dados
- **Leitura:** `Roteiro` (data, entregadorId, unidadeId, tempoTotalParado, status = Finalizado), filtrado por `unidadeId` do Supervisor local autenticado e pelo recorte de data.
- **Escrita:** nenhuma.

#### 9. Critérios de aceitação
- **Dado** 3 roteiros finalizados hoje na Unidade Centro com tempos totais parados de 75, 40 e 60 minutos, **quando** o Supervisor local visualiza o recorte "dia", **então** o sistema exibe o gráfico com esses 3 roteiros e o total agregado de 175 minutos.
- **Dado** um recorte "período" de 01/09/2026 a 24/09/2026 sem nenhum roteiro finalizado nesse intervalo, **quando** o Supervisor local consulta, **então** o sistema exibe "Nenhum dado disponível para o período selecionado".
- **Dado** um recorte "período" com data final anterior à inicial, **quando** o Supervisor local tenta consultar, **então** o sistema bloqueia e solicita um intervalo válido.

#### 10. Requisitos não funcionais relevantes
- **RNF03** — tempo de resposta do dashboard inferior a 3 segundos para consultas de até 12 meses. Atendido por agregações pré-calculadas por Roteiro (campo `tempoTotalParado` já persistido por UC15/UC14, não recalculado a cada consulta) e por índice composto em `(unidadeId, data)` na tabela de Roteiro.
- RNF02 — interface responsiva (desktop, principalmente, mas acessível em mobile).

#### 11. Questões em aberto
Nenhuma — granularidade dos recortes (dia/mês/período) e estratégia de performance (RNF03) resolvidas diretamente na spec, conforme boas práticas de agregação para dashboards de MVP.


![UC18 — diagrama de robustez](../diagramas/cenarios/C6-acompanhamento-e-analise/UC18-robustez.png)


### UC19 — Consultar histórico de pontos e tempos com endereços

#### 1. Cabeçalho
- **ID:** UC19
- **Nome:** Consultar histórico de pontos e tempos com endereços
- **Cenário(s):** C6 — Acompanhamento e análise
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF07

#### 2. Objetivo
Como Supervisor local, quero consultar o histórico detalhado de pontos e tempos parados por período, com os endereços de cada ponto, para investigar a operação de qualquer Entregador da minha Unidade.

#### 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado.
**Gatilho:** Supervisor local acessa a tela de histórico e informa um período (e, opcionalmente, um Entregador específico).

#### 4. Fluxo principal
1. Supervisor local acessa a tela de histórico.
2. Supervisor local informa o período (data inicial e final) e, opcionalmente, filtra por Entregador.
3. Sistema busca os Roteiros finalizados da Unidade no período, com seus Pontos (endereço, horaChegada, horaSaida, tempoParado).
4. Sistema exibe a lista de Roteiros e, para cada um, os Pontos em ordem sequencial com endereço e tempo parado.

#### 5. Fluxos alternativos e de exceção
- **2a. Período inválido (data final anterior à inicial):** sistema bloqueia e solicita um intervalo válido.
- **3a. Nenhum roteiro no período/filtro informado:** sistema exibe "Nenhum registro encontrado para os filtros selecionados".

#### 6. Pós-condições
- **Sucesso:** lista de Roteiros e Pontos do período exibida.
- **Falha:** nenhum dado exibido.

#### 7. Regras de negócio aplicadas
Nenhuma RN de negócio diretamente aplicável — consulta de dados já calculados por UC15 (cenário C4).

#### 8. Dados
- **Leitura:** `Roteiro` (data, entregadorId, unidadeId, status), `Ponto` (endereço, ordem, horaChegada, horaSaida, tempoParado), filtrados por `unidadeId` do Supervisor local autenticado.
- **Escrita:** nenhuma.

#### 9. Critérios de aceitação
- **Dado** um roteiro finalizado em 20/09/2026 com 4 pontos e seus endereços/tempos parados, **quando** o Supervisor local consulta o histórico desse período, **então** o sistema exibe o roteiro com os 4 pontos, cada um com endereço e tempo parado.
- **Dado** um filtro por Entregador específico sem nenhum roteiro no período, **quando** o Supervisor local consulta, **então** o sistema exibe "Nenhum registro encontrado para os filtros selecionados".
- **Dado** um período com data final anterior à inicial, **quando** o Supervisor local tenta consultar, **então** o sistema bloqueia e solicita um intervalo válido.

#### 10. Requisitos não funcionais relevantes
- RNF01 — depende da persistência do histórico completo.

#### 11. Questões em aberto
Nenhuma.


![UC19 — diagrama de robustez](../diagramas/cenarios/C6-acompanhamento-e-analise/UC19-robustez.png)


### UC20 — Consultar custo estimado do roteiro

#### 1. Cabeçalho
- **ID:** UC20
- **Nome:** Consultar custo estimado do roteiro
- **Cenário(s):** C6 — Acompanhamento e análise
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Should
- **Rastreio:** RF11 (ver [ADR-007](../../decisoes/ADR-007-calculo-custo-roteiro-uc-dedicado.md) — este UC apenas consulta o valor já calculado por UC23, cenário C4; não recalcula)

#### 2. Objetivo
Como Supervisor local, quero consultar o custo estimado de um roteiro finalizado para acompanhar o custo operacional da minha Unidade.

#### 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado; existe ao menos um Roteiro finalizado com `custoEstimado` calculado (UC14 → UC23, cenário C4).
**Gatilho:** Supervisor local acessa a tela de detalhe de um Roteiro finalizado.

#### 4. Fluxo principal
1. Supervisor local seleciona um Roteiro finalizado (via histórico, UC19, ou lista de roteiros da Unidade).
2. Sistema busca `distanciaTotal` e `custoEstimado` já gravados no Roteiro (calculados por UC23 ao finalizar).
3. Sistema exibe o custo estimado, a distância percorrida e os parâmetros usados no cálculo (combustível, rendimento km/litro do Entregador).

#### 5. Fluxos alternativos e de exceção
- **1a. Roteiro selecionado ainda não finalizado:** sistema informa que o custo só está disponível após a finalização do roteiro (UC14) e não exibe valor.

#### 6. Pós-condições
- **Sucesso:** custo estimado e distância exibidos.
- **Falha:** nenhum valor exibido; mensagem informativa.

#### 7. Regras de negócio aplicadas
- **RN07** (aplicada por UC23 no momento do cálculo, apenas exibida aqui): custo = combustível × rendimento km/litro × distância percorrida.

#### 8. Dados
- **Leitura:** `Roteiro.distanciaTotal`, `Roteiro.custoEstimado`, `Roteiro.status`; `Entregador.rendimentoKmLitro`; `Parametro.valorCombustivel` (para exibição informativa dos parâmetros usados).
- **Escrita:** nenhuma.

#### 9. Critérios de aceitação
- **Dado** um roteiro finalizado com `distanciaTotal = 42 km` e `custoEstimado = R$ 21,00`, **quando** o Supervisor local consulta o custo, **então** o sistema exibe exatamente esses valores, sem recalcular.
- **Dado** um roteiro ainda em andamento (não finalizado), **quando** o Supervisor local tenta consultar seu custo, **então** o sistema informa que o custo estará disponível após a finalização.

#### 10. Requisitos não funcionais relevantes
Nenhum diretamente além dos já cobertos por UC23.

#### 11. Questões em aberto
Nenhuma.


![UC20 — diagrama de robustez](../diagramas/cenarios/C6-acompanhamento-e-analise/UC20-robustez.png)


### UC21 — Exportar relatório

#### 1. Cabeçalho
- **ID:** UC21
- **Nome:** Exportar relatório
- **Cenário(s):** C6 — Acompanhamento e análise
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Could
- **Rastreio:** RF12 — `«extend»` de UC18 (dashboard) e UC19 (histórico)

#### 2. Objetivo
Como Supervisor local, quero exportar os dados que estou visualizando no dashboard ou no histórico, para analisá-los fora do sistema.

#### 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local está com uma consulta de UC18 ou UC19 aberta, com um recorte/período já definido.
**Gatilho:** Supervisor local aciona "Exportar" na tela de dashboard (UC18) ou de histórico (UC19).

#### 4. Fluxo principal
1. Supervisor local aciona "Exportar" a partir da tela de UC18 ou UC19.
2. Sistema gera um arquivo **CSV** com os dados atualmente filtrados (mesmo recorte/período/filtro da consulta em tela). Formato CSV escolhido por ser simples de gerar e consumir (Excel/planilhas), sem exigir biblioteca de geração de PDF no MVP.
3. Sistema disponibiliza o arquivo para download.

#### 5. Fluxos alternativos e de exceção
- **2a. Consulta de origem sem nenhum dado (lista vazia):** sistema informa que não há dados para exportar e não gera arquivo.

#### 6. Pós-condições
- **Sucesso:** arquivo CSV disponibilizado para download com os dados do recorte/período/filtro vigente.
- **Falha:** nenhum arquivo gerado.

#### 7. Regras de negócio aplicadas
Nenhuma — reaproveita os dados já filtrados/calculados por UC18 ou UC19.

#### 8. Dados
- **Leitura:** os mesmos dados já lidos pelo caso de uso estendido (UC18: agregados de tempo parado; UC19: pontos/tempos/endereços).
- **Escrita:** nenhuma persistente — gera um arquivo de saída (CSV) para download.

#### 9. Critérios de aceitação
- **Dado** uma consulta de histórico (UC19) filtrada por setembro/2026 com 5 roteiros, **quando** o Supervisor local exporta, **então** o sistema gera um CSV com as 5 linhas de roteiro (e seus pontos) correspondentes ao filtro.
- **Dado** uma consulta de dashboard (UC18) sem nenhum roteiro no recorte selecionado, **quando** o Supervisor local tenta exportar, **então** o sistema informa que não há dados para exportar.

#### 10. Requisitos não funcionais relevantes
- RNF01 — dados exportados refletem o que está persistido no histórico.

#### 11. Questões em aberto
Nenhuma — formato (CSV) e escopo (mesmo filtro da tela de origem) decididos nesta spec como escolha de MVP enxuto; evolução para PDF/outros formatos fica para fora do MVP.


![UC21 — diagrama de robustez](../diagramas/cenarios/C6-acompanhamento-e-analise/UC21-robustez.png)


### UC22 — Consultar o próprio histórico

#### 1. Cabeçalho
- **ID:** UC22
- **Nome:** Consultar o próprio histórico
- **Cenário(s):** C6 — Acompanhamento e análise
- **Ator principal:** Entregador
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Should
- **Rastreio:** RF07, RNF06 (ver [ADR-003](../../decisoes/ADR-003-historico-entregador.md) — Entregador só acessa o próprio histórico)

#### 2. Objetivo
Como Entregador, quero consultar meu próprio histórico de roteiros, pontos e tempos parados, para acompanhar meu desempenho.

#### 3. Pré-condições e gatilho
**Pré-condições:** Entregador autenticado.
**Gatilho:** Entregador acessa a tela "Meu histórico".

#### 4. Fluxo principal
1. Entregador acessa a tela "Meu histórico".
2. Entregador informa um período (data inicial e final).
3. Sistema busca os Roteiros finalizados do próprio Entregador autenticado (`entregadorId` = id do usuário logado) no período informado, com seus Pontos e tempos parados.
4. Sistema exibe a lista de Roteiros e Pontos do próprio Entregador.

#### 5. Fluxos alternativos e de exceção
- **2a. Período inválido (data final anterior à inicial):** sistema bloqueia e solicita um intervalo válido.
- **3a. Nenhum roteiro finalizado no período:** sistema exibe "Nenhum registro encontrado para o período selecionado".
- **3b. Tentativa de acessar histórico de outro entregador (ex.: manipulação de parâmetro na requisição):** sistema bloqueia a consulta — o filtro por `entregadorId` do próprio usuário autenticado é aplicado obrigatoriamente pelo back-end, nunca informado pelo cliente (RNF06, LGPD).

#### 6. Pós-condições
- **Sucesso:** histórico do próprio Entregador exibido.
- **Falha:** nenhum dado exibido.

#### 7. Regras de negócio aplicadas
Nenhuma RN de negócio diretamente aplicável — consulta de dados já calculados por UC15 (cenário C4), restrita ao próprio Entregador.

#### 8. Dados
- **Leitura:** `Roteiro` (data, entregadorId, tempoTotalParado, status), `Ponto` (endereço, horaChegada, horaSaida, tempoParado), filtrados obrigatoriamente por `entregadorId` = id do Entregador autenticado.
- **Escrita:** nenhuma.

#### 9. Critérios de aceitação
- **Dado** o entregador João com 2 roteiros finalizados em setembro/2026, **quando** ele consulta seu histórico desse período, **então** o sistema exibe apenas os 2 roteiros de João, com seus pontos e tempos.
- **Dado** o entregador João autenticado, **quando** ele tenta consultar (por qualquer meio) o histórico do entregador Maria, **então** o sistema bloqueia e retorna apenas dados do próprio João, nunca de Maria.
- **Dado** um período sem roteiros finalizados de João, **quando** ele consulta, **então** o sistema exibe "Nenhum registro encontrado para o período selecionado".

#### 10. Requisitos não funcionais relevantes
- **RNF06** — aderência à LGPD: minimização de dados pessoais, acesso restrito ao próprio titular dos dados.
- RNF02 — interface responsiva/mobile.

#### 11. Questões em aberto
Nenhuma.


![UC22 — diagrama de robustez](../diagramas/cenarios/C6-acompanhamento-e-analise/UC22-robustez.png)


## 5. Diagramas de classes

### Classes

Este documento explica as classes dos dois diagramas: [`modelo-conceitual.puml`](modelo-conceitual.puml) (domínio, sem métodos, ponto de partida para a seção 8 "Modelo de Dados" da especificação) e [`modelo-projeto.puml`](modelo-projeto.puml) (classes de projeto derivadas dos diagramas de robustez de cada UC, com métodos e dependências).

Duas extensões de modelagem foram necessárias para reconciliar o que as specs de casos de uso (geradas por cenário) descreviam de forma simplificada — ver [ADR-014](../decisoes/ADR-014-usuario-superclasse.md) e [ADR-015](../decisoes/ADR-015-item-roteiro-associativa.md). Nenhuma spec de UC precisou ser reaberta: as ADRs são a referência normativa para o modelo de classes.

#### Modelo conceitual

| Classe | Origem | Invariantes principais |
|---|---|---|
| `Estabelecimento` | Extensão (ADR-004) | É a raiz do isolamento multi-tenant; nenhuma entidade abaixo dele é visível fora dele. |
| `Unidade` | Extensão (ADR-001) | Pertence a exatamente um `Estabelecimento`. |
| `Usuario` (abstrata) | Extensão (ADR-014) | `unidadeId` é obrigatório exceto quando `perfil = SupervisorGeral`. `senhaHash` nunca é exposto fora da camada de autenticação. |
| `Entregador` | RF01, seção 8 da especificação | `rendimentoKmLitro > 0` (RN07, ADR-005). `documento` único por `Estabelecimento`. |
| `Supervisor` | RF02, seção 8 da especificação | Perfil `SupervisorLocal` tem `unidadeId` obrigatório; `SupervisorGeral` tem `unidadeId` nulo (escopo = todo o Estabelecimento). |
| `Parametro` | RF09/RF10, seção 8 | Um por `Unidade`. `valorCombustivel > 0`, `custoPorKm > 0`, `1 ≤ jornadaPadraoHoras ≤ 24`. |
| `Ponto` | RF03, seção 8 | `latitude`/`longitude` obrigatórios (ADR-009). Reutilizável entre múltiplos Roteiros (ADR-015) — não guarda dado de uma visita específica. |
| `Roteiro` | RF04, seção 8 | Pertence a um único `Entregador` e uma única `data` (RN05). Só transiciona para `Finalizado` quando todos os `ItemRoteiro` têm `horaSaida` (ADR-011). |
| `ItemRoteiro` | Extensão (ADR-015) | `ordem` sequencial única dentro do `Roteiro` (RN06). `tempoParado` não se aplica ao item de `ordem = 1` (RN01). |
| `Auditoria` | RNF05, extensão de registro | Imutável após criada; sempre associada a um `Usuario` autor e, quando aplicável, a um `ItemRoteiro`. |

#### Modelo de projeto

Camadas (ver [`arquitetura.md`](../arquitetura/arquitetura.md) para a stack completa):

- **Apresentação** — uma classe por tela (boundary dos diagramas de robustez), React. Cada tela depende apenas dos controllers que consome.
- **Aplicação** — um controller/serviço por control dos diagramas de robustez, agrupados por cenário (C1–C6) mais Autenticação. `CalculadoraTempoParado` e `CalculadoraDistanciaCusto` são serviços de sistema (sem boundary própria), reaproveitados por `RegistrarSaidaController`, `FinalizarRoteiroController` e `CorrigirHorarioController`.
- **Domínio** — mesmas classes do modelo conceitual, agora com os métodos de validação/cálculo que os controllers invocam.
- **Infraestrutura** — uma interface de repositório por agregado raiz (`Usuario`, `Unidade`, `Ponto`, `Roteiro`, `Parametro`, `Auditoria`), implementada via Prisma (ADR-008), sempre filtrando por `estabelecimento_id`.

#### Rastreabilidade robustez → projeto

Todo `boundary`/`control`/`entity` que aparece nos diagramas de robustez de `docs/cenarios/*/UCxx-robustez.puml` existe correspondentemente em `modelo-projeto.puml` (telas, controllers/serviços e classes de domínio); toda `entity` existe em `modelo-conceitual.puml` (diretamente ou como a associação `ItemRoteiro`, ADR-015).


![Modelo conceitual](../diagramas/classes/modelo-conceitual.png)


![Modelo de projeto](../diagramas/classes/modelo-projeto.png)


## 6. Matriz de rastreabilidade

### Matriz de rastreabilidade

RF/RN/RNF/critério de aceitação × caso de uso × classe. Fonte: `docs/referencia/especificacao-requisitos.pdf`, seções 4, 6, 7 e 10, mais extensões registradas em [`decisoes/`](decisoes/).

#### Requisitos funcionais (RF)

| ID | Descrição | Caso(s) de uso | Classe(s) |
|---|---|---|---|
| RF01 | Cadastrar motorista/motoboy | UC06 | `Entregador` ([ADR-014](decisoes/ADR-014-usuario-superclasse.md)) |
| RF02 | Cadastrar gerente/coordenador | UC02 | `Supervisor` |
| RF03 | Cadastrar pontos com endereço e coordenadas | UC07 | `Ponto` ([ADR-009](decisoes/ADR-009-coordenadas-obrigatorias.md)) |
| RF04 | Montar roteiro diário | UC09 | `Roteiro`, `ItemRoteiro` ([ADR-015](decisoes/ADR-015-item-roteiro-associativa.md)) |
| RF05 | Registrar chegada/saída em cada ponto | UC12, UC13 | `ItemRoteiro` |
| RF06 | Calcular tempo parado por ponto e total do roteiro | UC14, UC15 | `ItemRoteiro`, `Roteiro` |
| RF07 | Exibir histórico de pontos e tempos parados por período | UC19, UC22 | `Roteiro`, `ItemRoteiro`, `Ponto` |
| RF08 | Exibir dashboard de tempo parado (dia/mês/período) | UC18 | `Roteiro` |
| RF09 | Parametrizar custos | UC03 | `Parametro` |
| RF10 | Parametrizar regras de tempo parado e jornada padrão | UC04 | `Parametro` |
| RF11 | Calcular custo estimado do roteiro | UC23 (cálculo), UC20 (consulta) | `Roteiro`, `Entregador`, `Parametro` |
| RF12 | Exportar relatórios do período consultado | UC21 | — (reaproveita dados de UC18/UC19) |

#### Regras de negócio (RN)

| ID | Descrição | Caso(s) de uso | Classe(s) |
|---|---|---|---|
| RN01 | Ponto de partida não conta tempo parado | UC11, UC15 | `ItemRoteiro` |
| RN02 | Tempo parado no ponto = saída − chegada | UC15 | `ItemRoteiro` |
| RN03 | Tempo total parado = soma exceto partida | UC14, UC15 | `Roteiro` |
| RN04 | Jornada padrão de 8h/dia | UC04 | `Parametro` |
| RN05 | Roteiro pertence a um único motorista e uma única data | UC09 | `Roteiro` |
| RN06 | Pontos com ordem sequencial | UC09, UC12, UC13, UC14, UC23 | `ItemRoteiro` |
| RN07 | Custo do trajeto = combustível × rendimento km/litro × distância | UC23 | `Roteiro`, `Entregador`, `Parametro` |

#### Requisitos não funcionais (RNF)

| ID | Descrição | Caso(s) de uso | Classe(s) |
|---|---|---|---|
| RNF01 | Persistência com histórico completo | Todos os UCs de escrita (transversal) | Todas as entidades de `modelo-conceitual.puml` |
| RNF02 | Interface web responsiva (desktop e mobile) | Transversal — decisão de arquitetura, não um UC | — (ver [ADR-008](decisoes/ADR-008-stack-tecnologico.md)) |
| RNF03 | Dashboard responde em < 3s para até 12 meses | UC18 | `Roteiro` |
| RNF04 | Controle de acesso por perfil | UC00, UC05 | `Usuario` ([ADR-012](decisoes/ADR-012-perfis-de-acesso-fixos.md)) |
| RNF05 | Auditoria de alterações em pontos e horários | UC16, UC17 | `Auditoria` |
| RNF06 | Aderência à LGPD | UC22 (e UC00 quanto a credenciais) | `Usuario`, `Roteiro`, `ItemRoteiro` |

#### Extensões ao modelo original

| Extensão | ADR | Caso(s) de uso | Classe(s) |
|---|---|---|---|
| Unidade (filial) | [ADR-001](decisoes/ADR-001-unidade.md) | UC01 | `Unidade` |
| Estabelecimento (multi-tenant) | [ADR-004](decisoes/ADR-004-multi-tenant-estabelecimento.md) | — (provisionamento fora de escopo dos UCs) | `Estabelecimento` |
| Usuario como superclasse | [ADR-014](decisoes/ADR-014-usuario-superclasse.md) | UC00, UC02, UC05, UC06 | `Usuario`, `Entregador`, `Supervisor` |
| ItemRoteiro (associação Roteiro×Ponto) | [ADR-015](decisoes/ADR-015-item-roteiro-associativa.md) | UC09, UC11–UC16 | `ItemRoteiro` |
| Perfis de acesso fixos | [ADR-012](decisoes/ADR-012-perfis-de-acesso-fixos.md) | UC05 | `Usuario` |
| Recálculo em cascata na correção | [ADR-013](decisoes/ADR-013-recalculo-em-correcao.md) | UC16 | `ItemRoteiro`, `Roteiro` |

#### Critérios de aceitação da especificação (seção 10)

| Critério | Caso(s) de uso | Regra relacionada |
|---|---|---|
| Sistema não computa tempo parado no ponto de partida | UC11, UC15 | RN01 |
| Dashboard apresenta os três recortes (dia, mês, período) | UC18 | RF08 |
| Todo tempo parado exibido está vinculado a um endereço e uma data/hora | UC19, UC22 | RF07, `ItemRoteiro`+`Ponto` |
| Parâmetros de custo e de jornada alteráveis sem alteração de código | UC03, UC04 | RF09, RF10 |

#### Cobertura

Todos os RF01–RF12, RN01–RN07 e RNF01–RNF06 estão ligados a pelo menos um caso de uso. Todos os UC00–UC23 têm spec própria, aparecem em um diagrama de casos de uso do seu cenário e têm diagrama de robustez. Todo elemento dos diagramas de robustez existe em `docs/classes/modelo-projeto.puml`; toda `entity` existe em `docs/classes/modelo-conceitual.puml` (ver [`classes.md`](classes/classes.md)).


## 7. Decisões de arquitetura (ADRs)


### ADR-001: Introdução do conceito de Unidade

#### Status
Aceita

#### Contexto
A especificação de requisitos não modela filiais/unidades operacionais: entregadores, pontos, roteiros e gerentes/coordenadores aparecem como se pertencessem a uma única organização plana. Na prática, uma transportadora opera múltiplas filiais, cada uma com sua própria equipe de entregadores, base de pontos e supervisor.

#### Decisão
Introduzir a entidade **Unidade** (filial), não presente no modelo de dados original. Entregadores, Pontos, Roteiros e Supervisores locais pertencem a uma Unidade. Supervisor local atua sobre uma única Unidade; Supervisor geral herda Supervisor local (generalização de atores) e tem visão consolidada de todas as Unidades.

#### Consequências
- Todo cadastro de Entregador, Ponto e Roteiro passa a exigir associação a uma Unidade.
- Necessário um novo caso de uso `UC01 Cadastrar unidade`.
- Isolamento de dados por Unidade se torna princípio transversal (ver [constituição](../constituicao.md), item 2).
- Posteriormente refinada por [ADR-004](ADR-004-multi-tenant-estabelecimento.md): Unidade passa a ser subordinada a um Estabelecimento (tenant multi-tenant).


### ADR-002: Distância percorrida calculada via fórmula de Haversine

#### Status
Aceita

#### Contexto
RF11 exige calcular o custo estimado do roteiro a partir da distância percorrida. A especificação não define como essa distância é obtida, e RF01 não inclui leitura de odômetro do veículo.

#### Decisão
A distância percorrida do roteiro é **calculada pelo sistema**, somando a distância entre pontos consecutivos a partir de latitude/longitude cadastradas em cada Ponto (RF03), usando a fórmula de Haversine. O entregador não informa odômetro nem distância manualmente.

#### Consequências
- RF03 (cadastro de ponto) precisa garantir que latitude/longitude sejam obrigatórios para pontos usados em roteiros com cálculo de custo.
- Introduz um caso de uso de sistema dedicado ao cálculo (`UC23 Calcular distância e custo do roteiro`, ver [ADR-007](ADR-007-calculo-custo-roteiro-uc-dedicado.md)), incluído por `UC14 Finalizar roteiro`.
- Pontos sem coordenadas cadastradas impedem o cálculo completo da distância — comportamento exato registrado como questão em aberto na spec de UC23.


### ADR-003: Entregador só consulta o próprio histórico

#### Status
Aceita

#### Contexto
RF07 exige exibir histórico de pontos e tempos parados por período. RNF06 exige aderência à LGPD no tratamento de dados pessoais dos profissionais de campo. A especificação não deixa explícito se um entregador pode ver o histórico de outros.

#### Decisão
O Entregador só pode consultar o **próprio** histórico (`UC22 Consultar o próprio histórico`), nunca o de outro entregador. Consulta de histórico de qualquer entregador da Unidade é privilégio de Supervisor local/geral (`UC19`).

#### Consequências
- `UC22` e `UC19` são casos de uso distintos, embora ambos rastreiem RF07.
- `UC22` rastreia também RNF06 (LGPD) como justificativa da restrição.
- Toda consulta de histórico deve filtrar por identidade do ator autenticado quando o ator é Entregador.


### ADR-004: Multi-tenant — Estabelecimento contém Unidades

#### Status
Aceita

#### Contexto
Requisito extra do cliente (não constante na especificação de requisitos original): o sistema precisa ser multi-tenant, pois atenderá diferentes estabelecimentos (transportadoras/clientes) na mesma plataforma. Já existia a extensão **Unidade** ([ADR-001](ADR-001-unidade.md)), modelando filiais de uma única transportadora.

#### Decisão
Introduzir a entidade **Estabelecimento** como o nível de isolamento multi-tenant (tenant), acima de Unidade:

```
Estabelecimento (tenant)
└── Unidade (filial) 1..N
    └── Entregadores, Pontos, Roteiros, Supervisor local
```

- Supervisor geral atua sobre todas as Unidades do **seu** Estabelecimento — nunca de outro.
- Nenhum dado (Entregador, Ponto, Roteiro, Parâmetro, Auditoria) é acessível fora do Estabelecimento ao qual pertence.
- Estratégia de isolamento de dados: banco de dados compartilhado com coluna discriminadora `estabelecimento_id` em toda entidade operacional, aplicada obrigatoriamente em toda consulta pela camada de aplicação (ver [ADR-008](ADR-008-stack-tecnologico.md)). Escolhida em vez de schema-por-tenant ou banco-por-tenant por simplicidade operacional, adequada ao escopo de MVP.

#### Consequências
- `UC01 Cadastrar unidade` passa a criar uma Unidade dentro do Estabelecimento do Supervisor geral autenticado, não um Estabelecimento novo.
- A criação de um Estabelecimento (onboarding de um novo tenant) não é modelada como caso de uso do sistema neste MVP — fica registrada como **questão em aberto**: assume-se provisionamento operacional pela equipe do produto (ex. via script/admin interno), fora do escopo dos atores Entregador/Supervisor.
- Todo princípio de isolamento por Unidade ([ADR-001](ADR-001-unidade.md)) passa a ser um sub-caso do isolamento por Estabelecimento (ver [constituição](../constituicao.md), itens 1 e 2).
- Autenticação (`UC00`) precisa resolver o Estabelecimento do usuário antes de resolver sua Unidade e perfil.


### ADR-005: Rendimento km/litro é atributo do Entregador/veículo, não parâmetro global

#### Status
Aceita

#### Contexto
A especificação cita "km/litro do veículo" em dois lugares com sentidos aparentemente conflitantes:
- RF01 e a entidade `Motorista/Motoboy` (seção 8): rendimento km/litro como atributo por entregador/veículo.
- RF09 e a entidade `Parâmetro` (seção 8): km/litro do veículo como parâmetro de custo geral.

RN07 ("custo do trajeto é calculado a partir do valor do combustível, **do rendimento km/litro do veículo** e da distância percorrida") usa a expressão "do veículo", reforçando a leitura de atributo por entregador.

#### Decisão
Rendimento km/litro é modelado **apenas** como atributo do Entregador/veículo (`UC06 Cadastrar entregador`), nunca como parâmetro global compartilhado. `UC03 Parametrizar custos` cobre apenas valor do combustível e custo por km. O campo "km/litro do veículo" citado em RF09/entidade `Parâmetro` é considerado redundante na especificação original e não é implementado como parâmetro separado.

#### Consequências
- `UC20`/`UC23` usam o rendimento km/litro do Entregador dono do roteiro, não um valor de configuração global.
- Se dois entregadores tiverem veículos com rendimentos diferentes, o custo do roteiro reflete corretamente o veículo usado.


### ADR-006: "Pedido" não é uma entidade própria do modelo de dados

#### Status
Aceita

#### Contexto
A seção 9 (Entregáveis) da especificação cita "módulo de coleta de dados dos pontos do roteiro (entrada de pedidos) e identificação dos endereços dos pedidos para o roteiro". A seção 8 (Modelo de Dados), porém, só define a entidade `Ponto` — não existe entidade `Pedido`.

#### Decisão
"Pedido" é tratado como o processo de entrada de um endereço de entrega que **produz ou associa um `Ponto`** ao Roteiro do dia, não como uma entidade de domínio separada. `UC08 Registrar pedidos/endereços de entrega` é o caso de uso que alimenta a base de `Ponto` a partir dos endereços recebidos; não introduz uma nova entidade `Pedido` no modelo conceitual.

#### Consequências
- `modelo-conceitual.puml` não terá uma classe `Pedido`.
- `UC08` e `UC07 Cadastrar ponto` operam sobre a mesma entidade (`Ponto`); a relação exata entre os dois casos de uso (se `UC08` inclui `UC07` ou é um fluxo alternativo de entrada de dados) é registrada como **questão em aberto** na spec de `UC08`, a ser detalhada quando o cenário C3 for elaborado.


### ADR-007: Caso de uso de sistema dedicado ao cálculo de distância e custo (RF11/RN07)

#### Status
Aceita

#### Contexto
A tabela original de cenários/casos de uso tratava RF11 (calcular custo estimado) apenas como um caso de uso de consulta (`UC20 Consultar custo estimado do roteiro`), sem nenhum caso de uso responsável pelo cálculo em si. RN07 (fórmula do custo) não estava rastreada a nenhum caso de uso. Isso é assimétrico com o tratamento dado a RF06/RN02/RN03 (tempo parado), que têm `UC15 Calcular tempo parado` como caso de uso de sistema dedicado, incluído por `UC13`/`UC14`.

Adicionalmente, o escopo exato de `UC15` era ambíguo: sua rastreabilidade citava apenas RN02, embora fosse `«include»` tanto de `UC13` (cálculo por ponto) quanto de `UC14` (soma total do roteiro, RN03).

#### Decisão
1. Criar `UC23 Calcular distância e custo do roteiro` (ator sistema), `«include»` de `UC14 Finalizar roteiro`, rastreado a RF11 e RN07, responsável por aplicar a fórmula de Haversine ([ADR-002](ADR-002-distancia-haversine.md)) e o cálculo de custo. `UC20` permanece exclusivamente como caso de uso de consulta ao valor já calculado.
2. Ampliar o rastreio de `UC15 Calcular tempo parado` para `RF06, RN01, RN02, RN03`, documentando explicitamente seus dois modos de disparo: por ponto (incluído por `UC13`, aplica RN01/RN02) e total do roteiro (incluído por `UC14`, aplica RN03).

#### Consequências
- `UC14 Finalizar roteiro` passa a incluir dois casos de uso de sistema: `UC15` e `UC23`.
- A matriz de rastreabilidade final cobre RN07, antes ausente.
- `UC20` e `UC18`/`UC19` seguem o mesmo padrão (casos de uso de consulta, nunca de cálculo).


### ADR-008: Stack tecnológico e diagramas de arquitetura

#### Status
Aceita

#### Contexto
Requisito extra do cliente: documentar as tecnologias de front-end e back-end, com diagramas de componente e de execução, além de garantir uma aplicação usável tanto por Entregadores quanto por Supervisores, em desktop e mobile, sem aplicativo nativo publicado em loja (fora do escopo original) e já multi-tenant ([ADR-004](ADR-004-multi-tenant-estabelecimento.md)).

#### Decisão
- **Front-end:** React + TypeScript, SPA responsiva (mesma aplicação para desktop e mobile via web, sem app nativo), gráficos do dashboard (RF08) com Recharts.
- **Back-end:** Node.js + NestJS + TypeScript, API REST, autenticação JWT com claims de `estabelecimentoId`, `unidadeId` e perfil.
- **Banco de dados:** PostgreSQL, multi-tenant por coluna discriminadora `estabelecimento_id` em toda tabela operacional (ver [ADR-004](ADR-004-multi-tenant-estabelecimento.md)), aplicada via middleware/interceptor obrigatório em toda query.
- **ORM:** Prisma.
- **Empacotamento/execução:** contêineres Docker (front, back, banco), permitindo implantação em um único host de nuvem para o MVP.

Detalhamento completo, com diagramas de componente e de execução, em [`arquitetura/arquitetura.md`](../arquitetura/arquitetura.md).

#### Consequências
- TypeScript de ponta a ponta (front e back) simplifica tipagem compartilhada e reduz curva de aprendizado da equipe.
- Isolamento multi-tenant depende de disciplina de implementação (toda query passa pelo filtro de `estabelecimento_id`) — risco documentado em `arquitetura.md`.
- Escolha não é imposta pela disciplina; pode ser revista se a equipe tiver restrição de stack.


### ADR-009: Latitude/longitude obrigatórias no cadastro de Ponto

#### Status
Aceita

#### Contexto
UC23 (cálculo de distância e custo, [ADR-007](ADR-007-calculo-custo-roteiro-uc-dedicado.md)) ficava com um caso de exceção em aberto: o que fazer quando um Ponto do roteiro não tem latitude/longitude cadastradas. Deixar esse dado opcional empurra um problema de qualidade de dado para o momento de finalizar o roteiro (RF06/RF11), quando já é tarde para corrigir sem atrito para o Entregador em campo.

#### Decisão
`latitude` e `longitude` são campos **obrigatórios** em `UC07 Cadastrar ponto` (RF03). Não é possível salvar um Ponto sem coordenadas válidas. Isso elimina estruturalmente o caso "ponto sem coordenada" em `UC23` — todo Ponto que pode entrar num Roteiro já tem coordenadas.

#### Consequências
- `UC07` ganha validação: latitude ∈ [-90, 90], longitude ∈ [-180, 180], ambas obrigatórias.
- `UC23` não precisa mais de fluxo alternativo para coordenada ausente; a questão em aberto anterior é removida de sua spec.
- Endereços sem geocodificação disponível no momento do cadastro bloqueiam o cadastro do Ponto — cabe à UI (fora do escopo desta documentação de casos de uso) resolver isso com geocodificação automática ou exigir entrada manual de coordenadas.


### ADR-010: UC08 reaproveita ou cria Pontos via inclusão condicional de UC07

#### Status
Aceita

#### Contexto
[ADR-006](ADR-006-pedido-sem-entidade-propria.md) já havia decidido que "Pedido" não é uma entidade própria — UC08 (Registrar pedidos/endereços de entrega) alimenta a mesma entidade `Ponto` usada por UC07 (Cadastrar ponto). Faltava definir a relação exata entre os dois casos de uso.

#### Decisão
`UC08` é o ponto de entrada operacional dos endereços de entrega do dia. Para cada endereço recebido, `UC08`:
1. Busca se o endereço já existe na base de Pontos da Unidade (reuso, ex.: cliente recorrente).
2. Se existir, reaproveita o Ponto existente.
3. Se não existir, inclui `UC07 Cadastrar ponto` (`«include» condicional`) para criar um novo Ponto com aquele endereço/coordenadas.

`UC07` continua existindo como caso de uso independente para cadastro manual/antecipado de pontos na base (ex.: pontos fixos recorrentes cadastrados fora do fluxo de um pedido específico).

#### Consequências
- `casos-de-uso.puml` de C3 mostra `UC08 ..> UC07 : «include»` (condicional, documentado em texto — UML não tem uma notação padrão para "include condicional"; a spec de UC08 explica a condição).
- Nenhuma entidade nova é criada; `Ponto` continua sendo a única fonte de verdade de endereços geolocalizados.


### ADR-011: Finalização do roteiro exige todos os pontos concluídos, sem exceção

#### Status
Aceita

#### Contexto
A spec original de `UC14 Finalizar roteiro` deixava em aberto se seria possível finalizar um roteiro com pontos pendentes, propondo um fluxo alternativo de "confirmação explícita". Esse estado intermediário complica o cálculo de tempo total parado (RN03) e de custo (RN07) — um roteiro parcialmente concluído produziria indicadores incompletos e potencialmente enganosos no dashboard (RF08).

#### Decisão
`UC14` só pode ser executado quando **todos** os pontos do roteiro têm saída registrada (RN06). Não há finalização parcial nem confirmação explícita para pular pontos pendentes. Se o Entregador não concluir o roteiro no dia, o roteiro permanece "Em andamento" — retomar/cancelar um roteiro em aberto em outro dia fica registrado como **fora do escopo do MVP** (mesma linha da especificação, que já exclui roteirização automática e reotimização de rotas).

#### Consequências
- `UC14` fica mais simples: um único fluxo alternativo (`1a. pontos pendentes → sistema bloqueia e informa quais pontos faltam`), sem estado "finalizado com pendência".
- Indicadores de dashboard e custo sempre refletem roteiros completos.
- Cancelamento/retomada de roteiro incompleto é registrado como questão em aberto de produto (não de especificação), fora do escopo desta documentação.


### ADR-012: Perfis de acesso fixos (sem papéis customizáveis)

#### Status
Aceita

#### Contexto
RNF04 exige controle de acesso por perfil (motorista/motoboy, gerente/coordenador, administrador). `UC05 Gerenciar perfis de acesso` precisa de um escopo definido: criar papéis customizados (RBAC configurável) é um recurso de plataforma bem mais caro que o MVP exige.

#### Decisão
Os perfis do sistema são **fixos**: Entregador, Supervisor local, Supervisor geral (mapeados 1:1 aos atores, [atores.md](../atores.md)). `UC05 Gerenciar perfis de acesso` não cria papéis novos — ele **atribui um dos três perfis fixos** a um usuário e, quando aplicável, associa esse usuário a uma Unidade (Entregador, Supervisor local) ou ao Estabelecimento como um todo (Supervisor geral).

#### Consequências
- Não há tela de "criar papel"/"editar permissões de um papel" no MVP — permissões por perfil são fixas no código do back-end (checagem por enum de perfil), não configuráveis via UI.
- `UC05` é essencialmente um caso de uso de atribuição de perfil + Unidade a um usuário, executado por Supervisor geral.
- Evolução futura para RBAC configurável fica registrada como fora do escopo do MVP.


### ADR-013: Correção de horário recalcula tempo parado e, se aplicável, os totais do roteiro

#### Status
Aceita

#### Contexto
`UC16 Corrigir horário de chegada/saída` altera `horaChegada`/`horaSaida` de um Ponto já registrado. Sem uma decisão explícita, o `tempoParado` daquele ponto (RN02) ficaria desatualizado, e se o Roteiro já estivesse "Finalizado" (RN03, RF11), `tempoTotalParado` e `custoEstimado` também ficariam incorretos — o dashboard (RF08) e o custo estimado (UC20) passariam a exibir valores errados após uma correção auditada.

#### Decisão
Toda correção feita por `UC16` reaplica os mesmos cálculos de `UC15 Calcular tempo parado` (cenário C4) para o ponto corrigido:
1. Recalcula `tempoParado` do ponto corrigido (RN01/RN02).
2. Se o Roteiro já está "Finalizado", recalcula `tempoTotalParado` somando novamente todos os pontos (RN03, via `UC15` modo total). O status do Roteiro permanece "Finalizado" — a correção não reabre o roteiro para novas chegadas/saídas.
3. `distanciaTotal` e `custoEstimado` (`UC23`) **não** são recalculados por `UC16`: a correção afeta apenas horários, não coordenadas dos pontos, logo distância e custo permanecem inalterados.

#### Consequências
- `UC16` inclui `UC15` (modo por ponto e, condicionalmente, modo total) do cenário C4.
- Nenhum recálculo de `UC23` é necessário nesse fluxo.
- O registro de Auditoria (RNF05) guarda o `tempoParado` anterior e o novo, permitindo reconstituir o histórico de indicadores.


### ADR-014: Usuario como superclasse de Entregador e Supervisor

#### Status
Aceita

#### Contexto
Os cenários foram gerados em paralelo por pacote (C1–C6, Transversal). Isso produziu uma inconsistência entre eles: `UC00 Autenticar-se` (Transversal) modela as credenciais em uma entidade `Usuario` (id, email, senhaHash, perfil, estabelecimentoId, unidadeId, ativo); já `UC02` e `UC06` modelam `Supervisor` e `Entregador` como entidades próprias, cada uma repetindo campos de identidade/perfil/escopo (email, perfil, unidadeId, estabelecimentoId, status). Ao consolidar o modelo de classes, essa duplicação precisa ser resolvida — do contrário haveria duas fontes de verdade para a mesma credencial.

#### Decisão
`Usuario` é a superclasse (generalização) que concentra autenticação e escopo multi-tenant: `id`, `email`, `senhaHash`, `perfil` (enum `Entregador`|`SupervisorLocal`|`SupervisorGeral`), `estabelecimentoId`, `unidadeId` (nulo somente quando `perfil = SupervisorGeral`), `ativo`.

`Entregador` e `Supervisor` **herdam** de `Usuario` e acrescentam apenas os atributos de negócio específicos:
- `Entregador`: `nome`, `telefone`, `documento`, `veiculo`, `rendimentoKmLitro`.
- `Supervisor`: `nome`, `telefone`.

`Supervisor` não se divide em duas classes para local/geral — o `perfil` herdado de `Usuario` já discrimina isso, e `unidadeId` nulo indica escopo de Estabelecimento inteiro (Supervisor geral). Essa é uma modelagem de **classes de domínio**, diferente da **generalização de atores** (Supervisor geral → Supervisor local) já usada nos diagramas de casos de uso ([atores.md](../atores.md)) — ambas descrevem a mesma hierarquia de permissões, em níveis de abstração diferentes (ator vs. classe), e não precisam ter a mesma forma.

#### Consequências
- `modelo-conceitual.puml` mostra `Usuario` como superclasse abstrata, com `Entregador` e `Supervisor` como subclasses.
- As specs de UC02, UC05, UC06 e UC00 (já mescladas em `develop`) usam uma notação simplificada (campos repetidos em vez de herança explícita); esta ADR é a referência normativa para o modelo de classes — não é necessário reabrir/editar essas specs, que continuam corretas no nível de caso de uso.
- Toda consulta de autorização (perfil, unidade, estabelecimento) é feita a partir de `Usuario`, nunca duplicada em `Entregador`/`Supervisor`.


### ADR-015: ItemRoteiro como associação entre Roteiro e Ponto

#### Status
Aceita

#### Contexto
`UC08` decide reaproveitar um `Ponto` já existente na base da Unidade quando o endereço se repete (ver [ADR-010](ADR-010-uc08-inclui-uc07.md)) — ou seja, `Ponto` é uma entidade **reutilizável** entre vários Roteiros (ex.: um endereço de cliente recorrente). Já as specs de UC11–UC16 (cenários C4 e C5) referenciam `Ponto.horaChegada`, `Ponto.horaSaida`, `Ponto.tempoParado`, `Ponto.status` e `Ponto.ordem` como se fossem atributos do próprio `Ponto`. Se esses campos fossem gravados diretamente em `Ponto`, um endereço reutilizado em dois Roteiros diferentes teria seus horários de chegada/saída sobrescritos a cada novo roteiro — corrompendo o histórico (RF07, RNF01).

#### Decisão
Introduzir `ItemRoteiro` como entidade associativa entre `Roteiro` e `Ponto`: `id`, `roteiroId`, `pontoId`, `ordem`, `horaChegada`, `horaSaida`, `tempoParado`, `status` (enum `Pendente`|`AguardandoSaida`|`Concluido`). `Ponto` permanece somente com dados reutilizáveis e estáveis: `id`, `endereco`, `latitude`, `longitude`, `unidadeId`.

As referências a `Ponto.horaChegada` etc. nas specs de caso de uso já mescladas (UC11–UC16) são uma notação simplificada e continuam corretas no nível de caso de uso — leia-se "o `ItemRoteiro` correspondente àquele Ponto dentro do Roteiro em execução". Não é necessário reabrir essas specs; esta ADR é a referência normativa para o modelo de classes.

#### Consequências
- `modelo-conceitual.puml` modela `Roteiro "1" -- "*" ItemRoteiro` e `ItemRoteiro "*" -- "1" Ponto`.
- Histórico (RF07) e auditoria (RNF05) de um Ponto reutilizado preservam corretamente os dados de cada visita, em Roteiros diferentes.
- `RN06` (ordem sequencial) passa a ser um atributo de `ItemRoteiro`, não de `Ponto`.


## 8. Questões em aberto

Todas as ambiguidades identificadas durante a elaboração desta documentação foram resolvidas e registradas como ADRs (seção 7) ou diretamente nas seções "Questões em aberto" de cada spec de caso de uso, seguindo o princípio de nunca inventar regra de negócio silenciosamente. Nenhuma questão permanece pendente de validação do cliente no momento desta entrega.

Registro das decisões tomadas sem input direto do cliente, para validação numa eventual revisão do MVP:

- **ADR-004** — Multi-tenant: provisionamento de um novo Estabelecimento é operacional, fora do escopo dos casos de uso do sistema.
- **ADR-008** — Stack tecnológico proposto pela equipe (React/TypeScript, NestJS, PostgreSQL, Prisma, Docker); não imposto pela disciplina.
- **ADR-011** — Finalização de roteiro exige todos os pontos concluídos, sem estado parcial; retomada/cancelamento de roteiro incompleto fica fora do escopo do MVP.
- **UC21** — Formato de exportação de relatório definido como CSV, por simplicidade de implementação no MVP.
- **UC00** — Duração de sessão de 8h (alinhada à jornada padrão RN04); recuperação de senha fora do escopo do MVP.
