# UC15 — Calcular tempo parado

## 1. Cabeçalho
- **ID:** UC15
- **Nome:** Calcular tempo parado
- **Cenário(s):** C4 — Entregador sai para fazer entregas
- **Ator principal:** Sistema
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RF06, RN01, RN02, RN03

## 2. Objetivo
Como Sistema, quero calcular o tempo parado de um ponto (ao registrar saída) ou o tempo total parado do roteiro (ao finalizar), aplicando a regra de exclusão do ponto de partida.

## 3. Pré-condições e gatilho
**Pré-condições:** caso de uso executado exclusivamente por `«include»`, nunca acionado diretamente por um ator humano.
**Gatilho:** inclusão por UC13 Registrar saída do ponto (modo "por ponto") ou por UC14 Finalizar roteiro (modo "total do roteiro").

## 4. Fluxo principal

**Modo "por ponto" (disparado por UC13):**
1. Sistema verifica se o ponto é o ponto de partida (ordem = 1).
2. Se não for o ponto de partida, sistema calcula `tempoParado = horaSaida − horaChegada` (RN02).
3. Sistema retorna o valor calculado para UC13 gravar no ponto.

**Modo "total do roteiro" (disparado por UC14):**
1. Sistema percorre todos os pontos do roteiro, exceto o de partida.
2. Sistema soma os valores de `tempoParado` de cada ponto (RN03).
3. Sistema retorna o total para UC14 gravar no roteiro.

## 5. Fluxos alternativos e de exceção
- **1a (modo por ponto). Ponto é o de partida:** sistema retorna `tempoParado = não aplicável`, sem cálculo e sem entrar na soma total (RN01).

## 6. Pós-condições
- **Sucesso:** valor de tempo parado (por ponto ou total) retornado corretamente ao caso de uso que incluiu UC15.
- **Falha:** não se aplica — caso de uso de sistema, sem interação de exceção com usuário.

## 7. Regras de negócio aplicadas
- **RN01** (passo 1/1a, modo por ponto): ponto de partida não conta tempo parado.
- **RN02** (passo 2, modo por ponto): tempo parado = saída − chegada.
- **RN03** (passo 2, modo total): soma dos tempos parados, exceto o ponto de partida.

## 8. Dados
- **Leitura:** `Ponto.horaChegada`, `Ponto.horaSaida`, `Ponto.ordem` (modo por ponto); `Roteiro.pontos` (modo total).
- **Escrita:** nenhuma diretamente — retorna o valor calculado para o caso de uso incluidor gravar.

## 9. Critérios de aceitação
- **Dado** um ponto com `horaChegada = 09:15` e `horaSaida = 09:30`, **quando** o sistema calcula o tempo parado, **então** retorna 15 minutos.
- **Dado** o ponto de partida (ordem = 1), **quando** o sistema calcula o tempo parado, **então** retorna não aplicável, sem contar no total.
- **Dado** um roteiro com pontos 2, 3 e 4 com tempos parados de 15, 10 e 50 minutos, **quando** o sistema soma o tempo total, **então** retorna 75 minutos.

## 10. Requisitos não funcionais relevantes
Nenhum diretamente — caso de uso de sistema sem interface.

## 11. Questões em aberto
Nenhuma.
