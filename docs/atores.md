# Atores

Hierarquia de escopo: **Estabelecimento** (tenant) → **Unidade** (filial) → dados operacionais (Entregadores, Pontos, Roteiros). Ver [ADR-004](decisoes/ADR-004-multi-tenant-estabelecimento.md).

## Entregador
Corresponde a motorista/motoboy da especificação. Pertence a uma Unidade.

**Responsabilidades:** iniciar roteiro, registrar chegada e saída em cada ponto, finalizar roteiro, consultar o próprio roteiro do dia e o próprio histórico.

**Restrições:** só acessa dados da própria Unidade; só consulta o próprio histórico, nunca o de outro entregador (RNF06, [ADR-003](decisoes/ADR-003-historico-entregador.md)).

## Supervisor local
Corresponde a gerente/coordenador da especificação. Atua sobre uma única Unidade.

**Responsabilidades:** cadastrar entregadores e pontos da sua Unidade, montar roteiros diários, registrar pedidos/endereços de entrega, corrigir registros de chegada/saída (com auditoria), consultar trilha de auditoria, visualizar dashboard e histórico, consultar custo estimado, exportar relatórios — tudo restrito à própria Unidade.

## Supervisor geral
Corresponde a administrador/dono da especificação. Herda todas as permissões de Supervisor local (generalização de atores em UML), com visão consolidada de **todas as Unidades do seu Estabelecimento** — nunca de outro Estabelecimento.

**Responsabilidades adicionais:** cadastrar Unidades, cadastrar Supervisores locais, parametrizar custos e jornada/regras de tempo parado, gerenciar perfis de acesso.

## Sistema (ator não humano, casos de uso incluídos)
Executa cálculos derivados que nunca são informados manualmente: tempo parado por ponto e total do roteiro (UC15), distância percorrida e custo estimado do roteiro (UC23).

## Fora de escopo
A criação de um novo Estabelecimento (onboarding de um novo tenant/cliente da plataforma) não está descrita na especificação original e não é modelada como caso de uso do sistema neste MVP — é tratada como provisionamento operacional pela equipe do produto. Ver questão em aberto registrada em [ADR-004](decisoes/ADR-004-multi-tenant-estabelecimento.md).
