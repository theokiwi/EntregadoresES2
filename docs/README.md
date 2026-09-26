# Documentação — Entregadores

Índice da documentação de análise, arquitetura e design do MVP de Monitoramento de Tempo Parado em Roteiros. Fonte de verdade da especificação: [`referencia/especificacao-requisitos.pdf`](referencia/especificacao-requisitos.pdf).

## Negócio e lançamento

- [`custos-e-precificacao.md`](custos-e-precificacao.md) — memória de cálculo técnica.
- [`custos/plano-custos-precificacao.pdf`](custos/plano-custos-precificacao.pdf) — plano visual executivo de custos, margens e assinaturas.
- [`marketing/campanha-rotaagil.pdf`](marketing/campanha-rotaagil.pdf) — plano visual da campanha de lançamento.

## Como ler

1. [`constituicao.md`](constituicao.md) — princípios que valem para todo o projeto.
2. [`glossario.md`](glossario.md) — termos do domínio.
3. [`atores.md`](atores.md) — atores, hierarquia multi-tenant, responsabilidades.
4. [`decisoes/`](decisoes/) — ADRs: decisões e extensões em relação à especificação original.
5. [`arquitetura/`](arquitetura/) — tecnologias, diagrama de componentes e de execução.
6. [`cenarios/`](cenarios/) — um pacote por cenário (C1–C6 + transversal), cada um com diagrama de casos de uso e a spec + diagrama de robustez de cada caso de uso.
7. [`classes/`](classes/) — modelo conceitual e modelo de projeto.
8. [`rastreabilidade.md`](rastreabilidade.md) — matriz RF/RN/RNF × caso de uso × classe (gerada após todos os cenários).
9. [`entrega/`](entrega/) — documento consolidado final.

## Como renderizar os diagramas (PlantUML)

Requer Java, Graphviz e o PlantUML (`plantuml.jar`). Em ambiente Nix, sem instalação permanente:

```bash
nix-shell -p plantuml graphviz --run \
  'plantuml -tpng -tsvg -o ../../diagramas $(find docs -name "*.puml")'
```

Ou, com o PlantUML instalado globalmente:

```bash
find docs -name "*.puml" -exec plantuml -tpng -tsvg -o "$(pwd)/docs/diagramas" {} \;
```

Todos os `.puml` devem renderizar sem erro (ver critério na seção "Verificação final" do prompt de geração desta documentação, em [`prompt-claude-code-casos-de-uso.md`](prompt-claude-code-casos-de-uso.md)).
