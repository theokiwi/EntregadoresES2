# UC07 — Cadastrar ponto

## 1. Cabeçalho
- **ID:** UC07
- **Nome:** Cadastrar ponto
- **Cenário(s):** C2 — Montagem da equipe e da base de pontos; incluído condicionalmente por UC08 em C3 ([ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md))
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF03 (ver [ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md))

## 2. Objetivo
Como Supervisor local, quero cadastrar um ponto (endereço geolocalizado) na base da minha Unidade, para que ele possa ser usado em roteiros.

## 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado.
**Gatilho:** Supervisor local aciona "Novo ponto" na tela de gestão de pontos, ou UC08 dispara este caso de uso ao receber um endereço novo.

## 4. Fluxo principal
1. Supervisor local (ou UC08) informa endereço (logradouro, número, cidade, CEP) e coordenadas (latitude, longitude).
2. Sistema valida os dados informados.
3. Sistema grava o Ponto, associado à Unidade do Supervisor local autenticado.
4. Sistema confirma o cadastro e exibe o ponto na base da Unidade.

## 5. Fluxos alternativos e de exceção
- **2a. Latitude ou longitude ausentes ou fora da faixa válida:** sistema bloqueia o cadastro — coordenadas são obrigatórias ([ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md)).
- **2b. Campo de endereço obrigatório ausente:** sistema bloqueia o cadastro e sinaliza os campos inválidos.

## 6. Pós-condições
- **Sucesso:** novo `Ponto` persistido, associado à Unidade, disponível para compor um Roteiro (`UC09`).
- **Falha:** nenhum registro criado.

## 7. Regras de negócio aplicadas
Nenhuma RN da especificação incide diretamente neste UC; a obrigatoriedade de coordenadas é uma extensão registrada em [ADR-009](../../decisoes/ADR-009-coordenadas-obrigatorias.md), necessária para viabilizar `UC23` (RF11/RN07).

## 8. Dados
- **Escrita:** `Ponto` — `id`, `endereco` (texto, obrigatório: logradouro, número, cidade, CEP), `latitude` (decimal, obrigatório, −90 a 90), `longitude` (decimal, obrigatório, −180 a 180), `unidadeId` (obrigatório, preenchido automaticamente).

## 9. Critérios de aceitação
- **Dado** um Supervisor local autenticado na Unidade Centro, **quando** ele cadastra o ponto "Rua Peru, 55" com latitude −19.921, longitude −43.937, **então** o sistema cria o Ponto associado à Unidade Centro.
- **Dado** um cadastro de ponto sem latitude/longitude informadas, **quando** o Supervisor local tenta salvar, **então** o sistema bloqueia e informa que as coordenadas são obrigatórias.
- **Dado** uma latitude informada como 200 (fora da faixa −90 a 90), **quando** o Supervisor local tenta salvar, **então** o sistema bloqueia e sinaliza valor inválido.

## 10. Requisitos não funcionais relevantes
Nenhum diretamente aplicável.

## 11. Questões em aberto
Nenhuma — cadastro duplicado do mesmo endereço não é bloqueado aqui (reuso de Ponto existente é resolvido no fluxo de UC08, [ADR-010](../../decisoes/ADR-010-uc08-inclui-uc07.md)); geocodificação automática do endereço para coordenadas é um detalhe de implementação de UI, fora do escopo desta spec de caso de uso.
