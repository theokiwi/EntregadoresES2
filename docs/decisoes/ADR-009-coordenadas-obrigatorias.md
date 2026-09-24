# ADR-009: Latitude/longitude obrigatórias no cadastro de Ponto

## Status
Aceita

## Contexto
UC23 (cálculo de distância e custo, [ADR-007](ADR-007-calculo-custo-roteiro-uc-dedicado.md)) ficava com um caso de exceção em aberto: o que fazer quando um Ponto do roteiro não tem latitude/longitude cadastradas. Deixar esse dado opcional empurra um problema de qualidade de dado para o momento de finalizar o roteiro (RF06/RF11), quando já é tarde para corrigir sem atrito para o Entregador em campo.

## Decisão
`latitude` e `longitude` são campos **obrigatórios** em `UC07 Cadastrar ponto` (RF03). Não é possível salvar um Ponto sem coordenadas válidas. Isso elimina estruturalmente o caso "ponto sem coordenada" em `UC23` — todo Ponto que pode entrar num Roteiro já tem coordenadas.

## Consequências
- `UC07` ganha validação: latitude ∈ [-90, 90], longitude ∈ [-180, 180], ambas obrigatórias.
- `UC23` não precisa mais de fluxo alternativo para coordenada ausente; a questão em aberto anterior é removida de sua spec.
- Endereços sem geocodificação disponível no momento do cadastro bloqueiam o cadastro do Ponto — cabe à UI (fora do escopo desta documentação de casos de uso) resolver isso com geocodificação automática ou exigir entrada manual de coordenadas.
