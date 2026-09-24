# Prompt para o Claude Code: documentação de casos de uso, robustez e classes

> Antes de colar: coloque o PDF da especificação no repositório (sugestão: `docs/referencia/especificacao-requisitos.pdf`) e ajuste o caminho abaixo se usar outro.

---

## Contexto

Você vai produzir a documentação de análise e design de um sistema de controle de roteiros e tempo parado de entregadores de uma transportadora. A fonte de verdade é a especificação de requisitos em `docs/referencia/especificacao-requisitos.pdf`. Leia o documento inteiro antes de começar e use os IDs dele (RF01–RF12, RN01–RN07, RNF01–RNF06 etc.) em toda a rastreabilidade. Se algo que eu digo abaixo contradisser a especificação, pare e me pergunte antes de seguir.

A documentação será usada de duas formas:
1. Pela equipe de desenvolvimento, com Spec Driven Development: cada spec precisa ser precisa o bastante para que um agente de código implemente a partir dela sem adivinhar.
2. Como entrega acadêmica: um documento consolidado com todos os diagramas.

## Decisões já tomadas (não reabrir)

**Atores**
- **Entregador**: corresponde a motorista/motoboy da especificação.
- **Supervisor local**: corresponde a gerente/coordenador; atua sobre uma única unidade.
- **Supervisor geral**: corresponde ao administrador/dono; atua sobre todas as unidades.
- O supervisor geral herda o supervisor local (generalização de atores na UML), com visão consolidada de todas as unidades.

**Novo conceito: Unidade.** Não existe no modelo de dados da especificação. Entregadores, pontos, roteiros e supervisores locais pertencem a uma unidade. Registre essa extensão e a justificativa no documento.

**Distância percorrida (RF11)**: calculada pelo sistema, somando a distância entre pontos consecutivos do roteiro a partir de latitude/longitude (fórmula de Haversine). O entregador não informa odômetro.

**Histórico do entregador**: o entregador pode consultar apenas o próprio histórico (LGPD, RNF06).

**Autenticação**: modelada uma única vez, num diagrama transversal. Não usar `«include»` de "Autenticar-se" em cada caso de uso.

## Organização: cenários → casos de uso

Os casos de uso são agrupados por cenário (momento de uso do sistema). Cada cenário vira um pacote e um diagrama de casos de uso próprio. IDs de caso de uso são fixos e globais, porque um caso de uso pode aparecer em mais de um cenário. A ordem dos passos não aparece nas linhas do diagrama; ela vai na especificação textual.

| Cenário | Ator | Caso de uso | Rastreio |
|---|---|---|---|
| C1 Configuração inicial | Supervisor geral | UC01 Cadastrar unidade | extensão (Unidade) |
| | Supervisor geral | UC02 Cadastrar supervisor local | RF02 |
| | Supervisor geral | UC03 Parametrizar custos (combustível, custo/km) | RF09 |
| | Supervisor geral | UC04 Parametrizar jornada e regras de tempo parado | RF10, RN04 |
| | Supervisor geral | UC05 Gerenciar perfis de acesso | RNF04 |
| C2 Montagem da equipe e da base de pontos | Supervisor local | UC06 Cadastrar entregador (veículo, km/litro) | RF01 |
| | Supervisor local | UC07 Cadastrar ponto (endereço, coordenadas) | RF03 |
| C3 Planejamento do dia | Supervisor local | UC08 Registrar pedidos/endereços de entrega | entregáveis |
| | Supervisor local | UC09 Montar roteiro diário | RF04, RN05, RN06 |
| | Entregador | UC10 Consultar roteiro do dia | RF04 |
| C4 Entregador sai para fazer entregas | Entregador | UC11 Iniciar roteiro | RN01 |
| | Entregador | UC12 Registrar chegada no ponto | RF05 |
| | Entregador | UC13 Registrar saída do ponto | RF05 |
| | Entregador | UC14 Finalizar roteiro | RF06, RN03 |
| | (sistema) | UC15 Calcular tempo parado — `«include»` de UC13 e UC14 | RF06, RN02 |
| C5 Correção de registros | Supervisor local | UC16 Corrigir horário de chegada/saída (gera auditoria) | RNF05 |
| | Supervisor local | UC17 Consultar trilha de auditoria | RNF05 |
| C6 Acompanhamento e análise | Supervisor local | UC18 Visualizar dashboard de tempo parado (dia/mês/período) | RF08 |
| | Supervisor local | UC19 Consultar histórico de pontos e tempos com endereços | RF07 |
| | Supervisor local | UC20 Consultar custo estimado do roteiro | RF11 |
| | Supervisor local | UC21 Exportar relatório — `«extend»` de UC18 e UC19 | RF12 |
| | Entregador | UC22 Consultar o próprio histórico | RF07, RNF06 |
| Transversal | Todos | UC00 Autenticar-se | RNF04 |

Confira essa tabela contra o PDF. Se algum RF, RN ou critério de aceitação da especificação ficar sem caso de uso, ou se algum ID acima estiver errado, proponha o ajuste antes de gerar os arquivos.

## Estrutura de saída

```
docs/
  README.md                       # índice, como ler, como renderizar os diagramas
  constituicao.md                 # princípios que valem para todas as specs (ver abaixo)
  glossario.md                    # termos do domínio: ponto, roteiro, tempo parado, unidade...
  atores.md                       # atores, responsabilidades, permissões por unidade
  rastreabilidade.md              # matriz RF/RN/RNF/critério de aceitação × UC × classe
  decisoes/
    ADR-001-unidade.md
    ADR-002-distancia-haversine.md
    ADR-003-historico-entregador.md
  cenarios/
    C1-configuracao-inicial/
      cenario.md                  # objetivo do cenário, atores, pré-condições gerais
      casos-de-uso.puml           # diagrama de casos de uso do cenário
      UC01-cadastrar-unidade.md
      UC01-robustez.puml
      ...
    C2-.../ (mesmo padrão)
  classes/
    modelo-conceitual.puml        # domínio, sem métodos
    modelo-projeto.puml           # classes de projeto derivadas da robustez
    classes.md                    # explicação de cada classe, atributos, invariantes
  diagramas/                      # PNG/SVG renderizados de todos os .puml
  entrega/
    documento-consolidado.md      # tudo num documento só, com as imagens
    documento-consolidado.pdf     # e/ou .docx, gerado com pandoc
```

## Formato de cada spec de caso de uso (`UCxx-*.md`)

Use exatamente estas seções, nesta ordem, para que a equipe e os agentes de código encontrem sempre as mesmas coisas no mesmo lugar:

1. **Cabeçalho**: ID, nome, cenário(s), ator principal, atores secundários, prioridade (MoSCoW), rastreio (RF/RN/RNF).
2. **Objetivo**: uma frase, do ponto de vista do ator.
3. **Pré-condições** e **gatilho**.
4. **Fluxo principal**: passos numerados, alternando ator e sistema.
5. **Fluxos alternativos e de exceção**: numerados a partir do passo em que se desviam (ex.: `4a`).
6. **Pós-condições**: de sucesso e de falha.
7. **Regras de negócio aplicadas**: cite a RN pelo ID e diga em qual passo ela incide.
8. **Dados**: entidades lidas/escritas e campos relevantes, com tipos e validações.
9. **Critérios de aceitação**: cenários `Dado / Quando / Então`, testáveis, cobrindo fluxo principal, cada alternativo e cada RN. Inclua valores concretos (horários, distâncias, custos) para os casos de cálculo.
10. **Requisitos não funcionais relevantes**: ex. auditoria, LGPD, perfis de acesso.
11. **Questões em aberto**: tudo o que você não conseguiu decidir a partir da especificação. Nunca invente regra de negócio silenciosamente.

## Constituição (`constituicao.md`)

Registre os princípios transversais que valem para todas as specs, derivados dos RNFs e das decisões acima. No mínimo: isolamento por unidade (supervisor local só vê a própria unidade), auditoria de toda alteração de registro de tempo, minimização de dados pessoais, fuso horário único para registros de tempo, e a regra de que toda spec deve ter critérios de aceitação testáveis.

## Diagramas (PlantUML)

**Casos de uso (um por cenário)**
- `left to right direction`, retângulo do sistema nomeado, atores fora do retângulo.
- Generalização Supervisor geral → Supervisor local no diagrama transversal e no C1.
- `«include»` e `«extend»` somente onde listados na tabela ou onde você justificar na spec.
- Cada elipse mostra o ID e o nome (ex.: `UC12 Registrar chegada no ponto`).

**Robustez (um por caso de uso)**
- Use os elementos `actor`, `boundary`, `control` e `entity` do PlantUML.
- Respeite as regras de robustez: ator só fala com boundary; boundary só fala com control; control fala com entity, com outros controls e com boundaries; entity não fala com boundary nem com ator.
- Nomeie boundaries pela tela/endpoint (ex.: `TelaRoteiroDoDia`), controls pela responsabilidade (ex.: `RegistrarSaidaController`, `CalculadoraTempoParado`) e entities pelos nomes do modelo conceitual.
- Numere as mensagens seguindo os passos do fluxo principal da spec.
- Cada boundary, control e entity que aparecer aqui precisa existir no modelo de projeto.

**Classes**
- `modelo-conceitual.puml`: entidades de domínio, atributos com tipo, multiplicidades, sem métodos. Parta do modelo de dados da seção de dados da especificação e acrescente `Unidade`, `Auditoria` e o que mais for necessário, sinalizando o que é extensão.
- `modelo-projeto.puml`: classes de projeto derivadas dos diagramas de robustez (controls viram serviços/casos de uso, boundaries viram controladores/telas, entities viram entidades de domínio), com métodos e dependências. Agrupe em pacotes por camada.

**Renderização**
- Verifique se `java`, `graphviz` e o PlantUML estão disponíveis; se não, instale (ex.: `plantuml.jar` com `java -jar`).
- Gere PNG e SVG de todos os `.puml` em `docs/diagramas/`. Todo diagrama tem que renderizar sem erro.

## Documento consolidado (`docs/entrega/`)

Um único Markdown, na ordem: introdução e escopo, atores, visão geral dos cenários, e para cada cenário o diagrama de casos de uso seguido das specs e diagramas de robustez de cada caso de uso; depois os diagramas de classes, a matriz de rastreabilidade, as decisões (ADRs) e as questões em aberto. Gere o PDF (e o .docx, se possível) com pandoc, com sumário e imagens embutidas.

## Como trabalhar

1. Leia o PDF e me mostre: a tabela de cenários/casos de uso conferida contra a especificação, os ajustes que você propõe e as questões em aberto que já identificou. **Espere minha aprovação.**
2. Gere `constituicao.md`, `glossario.md`, `atores.md` e as ADRs.
3. Faça o cenário **C4 (Entregador sai para fazer entregas)** completo primeiro: diagrama de casos de uso, specs e robustez de cada UC. Pare e me mostre, para eu validar o padrão antes de você replicar.
4. Replique para os demais cenários.
5. Gere os diagramas de classes a partir dos diagramas de robustez.
6. Gere a matriz de rastreabilidade e o documento consolidado.

## Verificação final (obrigatória antes de dizer que terminou)

- Todos os RF, RN e critérios de aceitação da especificação aparecem na matriz de rastreabilidade ligados a pelo menos um UC.
- Todo UC tem spec, aparece em algum diagrama de casos de uso e tem diagrama de robustez.
- Todo elemento dos diagramas de robustez existe no modelo de projeto, e toda entity existe no modelo conceitual.
- Todos os `.puml` renderizam sem erro.
- Nenhuma regra de negócio foi inventada: o que não está na especificação ou nas decisões acima está em "Questões em aberto".
- Me entregue um resumo curto com o que foi gerado, a lista de questões em aberto e qualquer ponto em que você divergiu deste prompt.
