# UC06 — Cadastrar entregador

## 1. Cabeçalho
- **ID:** UC06
- **Nome:** Cadastrar entregador
- **Cenário(s):** C2 — Montagem da equipe e da base de pontos
- **Ator principal:** Supervisor local
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF01 (ver [ADR-005](../../decisoes/ADR-005-km-litro-atributo-motorista.md))

## 2. Objetivo
Como Supervisor local, quero cadastrar um entregador da minha Unidade, com os dados do seu veículo, para que ele possa executar roteiros.

## 3. Pré-condições e gatilho
**Pré-condições:** Supervisor local autenticado.
**Gatilho:** Supervisor local aciona "Novo entregador" na tela de gestão de equipe.

## 4. Fluxo principal
1. Supervisor local acessa a tela de cadastro de entregador.
2. Supervisor local informa nome, telefone, documento (CPF), dados do veículo e rendimento km/litro.
3. Sistema valida os dados informados (seção 8).
4. Sistema grava o Entregador, associado à Unidade do Supervisor local autenticado.
5. Sistema confirma o cadastro e exibe o entregador na lista da Unidade.

## 5. Fluxos alternativos e de exceção
- **3a. CPF já cadastrado no mesmo Estabelecimento:** sistema bloqueia o cadastro e informa que já existe um entregador com esse documento.
- **3b. Campo obrigatório ausente ou rendimento km/litro ≤ 0:** sistema bloqueia o cadastro e sinaliza os campos inválidos.

## 6. Pós-condições
- **Sucesso:** novo `Entregador` persistido, associado à Unidade, disponível para ser escolhido em `UC09 Montar roteiro diário`.
- **Falha:** nenhum registro criado.

## 7. Regras de negócio aplicadas
Nenhuma RN da especificação incide diretamente neste UC (é um cadastro base); a associação à Unidade decorre da extensão [ADR-001](../../decisoes/ADR-001-unidade.md)/[ADR-004](../../decisoes/ADR-004-multi-tenant-estabelecimento.md).

## 8. Dados
- **Escrita:** `Entregador` — `id`, `nome` (texto, obrigatório), `telefone` (texto, obrigatório, formato `(DD) 9XXXX-XXXX`), `documento` (CPF, 11 dígitos, obrigatório, único por Estabelecimento), `veiculo` (texto, ex. placa/modelo, obrigatório), `rendimentoKmLitro` (decimal > 0, obrigatório), `unidadeId` (obrigatório, preenchido automaticamente).

## 9. Critérios de aceitação
- **Dado** um Supervisor local autenticado na Unidade Centro, **quando** ele cadastra o entregador João, CPF 111.111.111-11, veículo "Moto Honda CG", rendimento 30 km/L, **então** o sistema cria o Entregador associado à Unidade Centro.
- **Dado** que já existe um entregador com CPF 111.111.111-11 no Estabelecimento, **quando** o Supervisor local tenta cadastrar outro entregador com o mesmo CPF, **então** o sistema bloqueia e informa duplicidade.
- **Dado** um cadastro com rendimento km/litro = 0, **quando** o Supervisor local tenta salvar, **então** o sistema bloqueia e sinaliza que o rendimento deve ser maior que zero.

## 10. Requisitos não funcionais relevantes
- RNF06 — dado pessoal (CPF, telefone) tratado conforme LGPD: coletado apenas para fins operacionais do cadastro.

## 11. Questões em aberto
Nenhuma — validações de unicidade (CPF por Estabelecimento) e obrigatoriedade de campos resolvidas nesta spec como decisão de implementação de MVP.
