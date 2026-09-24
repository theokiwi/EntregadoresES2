# UC00 — Autenticar-se

## 1. Cabeçalho
- **ID:** UC00
- **Nome:** Autenticar-se
- **Cenário(s):** Transversal — pré-requisito de todos os demais cenários
- **Ator principal:** Entregador, Supervisor local, Supervisor geral
- **Atores secundários:** —
- **Prioridade (MoSCoW):** Must
- **Rastreio:** RNF04

## 2. Objetivo
Como usuário do sistema (Entregador ou Supervisor), quero autenticar-me com minhas credenciais para acessar apenas as funcionalidades e os dados do meu perfil, da minha Unidade e do meu Estabelecimento.

## 3. Pré-condições e gatilho
**Pré-condições:** usuário possui credencial (e-mail/senha) previamente cadastrada por um Supervisor, com um perfil fixo atribuído ([ADR-012](../../decisoes/ADR-012-perfis-de-acesso-fixos.md)).
**Gatilho:** usuário acessa a aplicação e informa e-mail e senha.

## 4. Fluxo principal
1. Usuário informa e-mail e senha na tela de login.
2. Sistema valida a credencial (compara hash de senha).
3. Sistema resolve o perfil do usuário (Entregador | Supervisor local | Supervisor geral), o `estabelecimentoId` e o `unidadeId` (quando aplicável — Supervisor geral não tem Unidade única).
4. Sistema emite um token de sessão (JWT) contendo perfil, `estabelecimentoId` e `unidadeId`, com validade de 8 horas (alinhada à jornada padrão, RN04).
5. Sistema redireciona o usuário para a tela inicial do seu perfil (roteiro do dia para Entregador; dashboard para Supervisor).

## 5. Fluxos alternativos e de exceção
- **2a. E-mail ou senha inválidos:** sistema exibe mensagem genérica "e-mail ou senha inválidos" (não revela qual dos dois está errado, por segurança) e não emite token.
- **2b. Usuário inativo/desligado:** sistema bloqueia o login e exibe "usuário inativo, contate seu supervisor".
- **4a. Token expira durante o uso:** sistema exige novo login na próxima ação que exija autenticação.

## 6. Pós-condições
- **Sucesso:** token de sessão válido emitido, contendo perfil, `estabelecimentoId` e `unidadeId`; usuário redirecionado à tela inicial do seu perfil.
- **Falha:** nenhum token emitido; usuário permanece na tela de login.

## 7. Regras de negócio aplicadas
- **RNF04** (passos 3–4): controle de acesso por perfil resolvido no login e aplicado a toda requisição subsequente via claims do token.

## 8. Dados
- **Leitura:** `Usuario` (id, email, senhaHash, perfil, estabelecimentoId, unidadeId nullable, ativo).
- **Escrita:** nenhuma persistente (token é stateless/JWT); opcionalmente log de tentativa de login para auditoria de segurança (fora do escopo funcional de RNF05, que cobre auditoria de dados operacionais).

## 9. Critérios de aceitação
- **Dado** um Supervisor local com e-mail `maria@transportadora.com` e senha correta, **quando** ele se autentica, **então** o sistema emite um token com perfil `SupervisorLocal`, o `estabelecimentoId` e o `unidadeId` corretos, e o redireciona ao dashboard.
- **Dado** um usuário que informa a senha incorreta, **quando** tenta autenticar, **então** o sistema exibe "e-mail ou senha inválidos" e não emite token.
- **Dado** um usuário marcado como inativo, **quando** tenta autenticar com credenciais corretas, **então** o sistema bloqueia o login e informa que o usuário está inativo.
- **Dado** um Entregador autenticado há mais de 8 horas, **quando** tenta registrar uma chegada (UC12), **então** o sistema exige novo login antes de prosseguir.

## 10. Requisitos não funcionais relevantes
- RNF04 — controle de acesso por perfil.
- RNF06 (LGPD/boas práticas) — senha nunca armazenada nem trafega em texto puro (hash + HTTPS); mensagens de erro de login não revelam se o e-mail existe na base.

## 11. Questões em aberto
Resolvidas proativamente para manter o MVP enxuto, sem necessidade de validação externa:
- **Recuperação de senha:** fora do escopo deste MVP. Senha inicial é definida pelo Supervisor ao cadastrar o usuário (UC02/UC05/UC06); redefinição, se necessária, é feita por um Supervisor, não por fluxo de autoatendimento. Pode ser adicionado em iteração futura.
- **Bloqueio por tentativas malsucedidas:** não implementado no MVP (mantém o fluxo simples); mitigação de força bruta fica a cargo de rate-limiting de infraestrutura, fora do escopo desta documentação de casos de uso.
- **Duração da sessão:** fixada em 8 horas, alinhada à jornada padrão (RN04) — decisão de engenharia, não uma regra de negócio da especificação.
