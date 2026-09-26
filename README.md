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

✅ MVP funcional com os casos de uso UC00–UC23 implementados, interface web responsiva,
controle de acesso por perfil, dashboard, histórico, auditoria e exportação CSV.

## Assinatura self-service e pagamento demonstrativo

Na tela de login, selecione **Ver planos e assinar** para escolher entre os planos Essencial,
Profissional e Escala. O fluxo cria a empresa, a primeira unidade e o administrador, permitindo
começar a configuração sem contato com a equipe comercial. Depois do acesso, o administrador
pode consultar ou trocar o plano em **Administração > Minha assinatura**.

> **Importante:** todo o pagamento deste MVP é **mockado/simulado**. Nenhum dado é enviado a
> adquirente ou gateway e nenhuma cobrança real acontece. Use um número fictício de 16 dígitos;
> apenas os quatro últimos dígitos são armazenados para compor a demonstração. CVV e validade
> nunca são persistidos. Para produção, o backend deve ser integrado a um provedor PCI-compliant.

As premissas de infraestrutura, APIs externas, custos por escala e preços necessários para
diferentes margens de lucro estão no documento técnico
[`docs/custos-e-precificacao.md`](docs/custos-e-precificacao.md) e no plano visual executivo
[`docs/custos/plano-custos-precificacao.pdf`](docs/custos/plano-custos-precificacao.pdf).

## Início rápido (setup automático)

Os instaladores configuram Node.js, Docker, PostgreSQL, dependências, migrations e a base
demonstrativa. Execute na raiz do projeto:

**Ubuntu 22.04+**

```bash
./scripts/setup-ubuntu.sh
```

**Windows 10/11 (PowerShell)**

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\setup-windows.ps1
```

No Windows, o Docker Desktop usa WSL 2. Na primeira instalação, o sistema pode pedir a
ativação/reinicialização desse recurso; depois, execute novamente o mesmo script.

## Início manual

Pré-requisitos: Node.js 20 ou superior, npm e Docker com Compose.

```bash
# 1. Banco PostgreSQL na porta 5433
docker compose up -d postgres

# 2. Backend, schema e dados demonstrativos
cd backend
cp .env.example .env       # PowerShell: Copy-Item .env.example .env
npm install
npm run db:setup
npm run start:dev

# 3. Em outro terminal, frontend
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. A API fica em `http://localhost:3000`. Para usar outra
URL de API, defina `VITE_API_URL` no ambiente do frontend.

O backend aplica automaticamente as migrations pendentes antes de iniciar. Depois de
uma atualização do projeto, reinicie o processo do backend para que novos campos do
banco sejam criados antes das consultas da API.

Para habilitar o autocomplete e a seleção de endereços pelo mapa, crie uma chave gratuita
no Geoapify e defina `VITE_GEOAPIFY_API_KEY` no arquivo `frontend/.env`. A interface usa
Leaflet e dados cartográficos do OpenStreetMap.

## Banco de dados demonstrativo

O script `npm run db:demo`, dentro de `backend`, aplica as migrations e gera a base
mockada completa. `npm run db:setup` é um alias para o mesmo comando, usado pelos
instaladores. O seed é idempotente: pode ser executado novamente para restaurar os
cenários de demonstração sem duplicá-los e sem apagar cadastros alheios ao mock.

```bash
docker compose up -d postgres
cd backend
cp .env.example .env       # somente na primeira execução
npm install                # somente na primeira execução
npm run db:demo
```

As datas são calculadas em relação ao dia da execução. Assim, os filtros padrão sempre
abrem com informações recentes, enquanto períodos maiores demonstram agrupamentos
semanais, mensais e anuais. O script cria:

- duas unidades e parâmetros de custo/jornada;
- um supervisor geral, dois supervisores locais e seis entregadores, com motos e utilitários;
- 12 pontos georreferenciados nas regiões Centro e Norte de Belo Horizonte;
- 576 roteiros finalizados distribuídos por quatro anos e pelas duas unidades;
- uma rota de hoje pronta para iniciar e outra em andamento;
- tempos de parada, distâncias, consumo, custos e receitas variados para rankings e gráficos;
- três correções justificadas para demonstrar a trilha de auditoria;
- uma assinatura Profissional com pagamento explicitamente simulado.

Os dados foram desenhados como um benchmark operacional, com diferenças persistentes:

- **João / Unidade Centro:** alto volume, maior distância, pouco tempo parado, baixo custo
  por quilômetro e ótima margem;
- **Mariana / Unidade Centro:** desempenho bom e consistente;
- **Beatriz / Unidade Norte:** desempenho intermediário;
- **Carlos, Rafael e Larissa:** gargalos progressivamente mais evidentes, com menor volume,
  mais tempo parado, custo por quilômetro alto e margem reduzida;
- **Unidade Centro:** referência de alta produtividade e eficiência;
- **Unidade Norte:** operação crítica, adequada para demonstrar alertas, comparações e
  oportunidades de melhoria.

Para visualizar toda a diferença, entre como supervisor geral e selecione no dashboard
um período que comece quatro anos antes da data atual. Alterne entre as escalas mensal e
anual e consulte os rankings de unidades e entregadores.

Todos os usuários de demonstração usam a senha `Demo@123`:

| Perfil | Login | Cenário sugerido |
|---|---|---|
| Supervisor geral | `admin@demo.com` | Dashboard geral, unidades, parâmetros e perfis |
| Supervisor Centro | `supervisor@demo.com` | Dashboard local, planejamento, histórico e auditoria |
| Supervisor Norte | `supervisor.norte@demo.com` | Isolamento por unidade e comparação de equipe |
| Entregador | `joao@demo.com` | Rota de hoje ainda não iniciada |
| Entregador | `mariana@demo.com` | Rota de hoje em andamento |
| Entregador | `carlos@demo.com` | Histórico pessoal |
| Entregador Norte | `beatriz@demo.com` | Histórico da segunda unidade |

Se o navegador já estava aberto antes de executar o seed, saia e entre novamente com uma
das contas acima. O frontend também limpa automaticamente tokens expirados e redireciona
para o login ao receber `401 Unauthorized`.

O volume `rotaagil_postgres` preserva os dados entre reinicializações. Para apagar a base
Docker por completo (ação destrutiva), use `docker compose down -v` e rode o instalador ou
o setup manual novamente.

## Comandos úteis

```bash
docker compose up -d postgres  # inicia somente o banco
docker compose stop postgres   # pausa o banco sem apagar dados
cd backend && npm test         # testes unitários
cd backend && npm run test:e2e # testes end-to-end
cd frontend && npm run build   # build de produção do frontend
```

Os testes end-to-end usam automaticamente o banco PostgreSQL isolado `entregadores_e2e`.
O runner cria esse banco quando necessário e recusa executar a limpeza destrutiva no banco
de desenvolvimento, preservando a base demonstrativa.
