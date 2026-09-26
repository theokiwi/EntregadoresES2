# Auditoria da UI — 10 heurísticas de Nielsen

Esta matriz é o critério de aceite para mudanças de interface. A auditoria cobre o shell compartilhado e os fluxos de autenticação, painel, histórico, cadastros, pedidos, planejamento, execução, custos, correções, auditoria, parâmetros e perfis.

| Heurística | Evidência na interface |
|---|---|
| 1. Visibilidade do status | Consultas exibem carregamento, vazio e erro; mutações desabilitam o envio e mudam o texto durante a operação; sucessos e erros usam regiões vivas (`status`/`alert`). |
| 2. Correspondência com o mundo real | Rótulos usam o vocabulário operacional: rota, ponto, chegada, saída, tempo parado, unidade e entregador; datas e valores são apresentados em formato brasileiro. |
| 3. Controle e liberdade | Menu móvel, mapa e sugestões podem ser fechados; o mapa aceita Escape e devolve o foco; pontos podem ser adicionados, reordenados e removidos antes do envio. |
| 4. Consistência e padrões | `PageHeader`, `Card`, `Field`, botões, badges e feedback são compartilhados; títulos e descrições seguem a mesma hierarquia; navegação ativa é consistente. |
| 5. Prevenção de erros | Campos obrigatórios e tipos nativos validam antes do envio; ações inválidas ficam desabilitadas; limites de reordenação são bloqueados; finalizar rota exige confirmação explícita. |
| 6. Reconhecimento em vez de memorização | Navegação agrupa tarefas por domínio; cabeçalhos explicam cada tela; seletores listam nomes legíveis; estados vazios orientam o próximo passo. |
| 7. Flexibilidade e eficiência | Filtros reduzem conjuntos de dados; busca localiza roteiro e usuário; autocomplete e mapa aceleram endereços; interface responde a desktop e celular. |
| 8. Estética e design minimalista | Hierarquia visual reutilizável, texto contextual curto, ações primárias destacadas, detalhes sob demanda e redução de movimento respeitada. |
| 9. Reconhecer, diagnosticar e recuperar de erros | Mensagens da API são traduzidas para feedback visível; falhas não substituem o conteúdo sem explicação; formulários mantêm os dados para correção e nova tentativa. |
| 10. Ajuda e documentação | Descrições de página, dicas de campos, instruções de mapa e estados vazios oferecem ajuda no contexto; regras de negócio relevantes aparecem junto da ação. |

## Verificação transversal

- Toda rota autenticada atualiza o título do documento e anuncia a mudança de página.
- Há link de salto para o conteúdo, landmarks nomeados, foco visível e suporte a navegação por teclado.
- Ícones decorativos são ocultos de tecnologia assistiva; controles apenas visuais recebem nome acessível.
- Layouts adaptam ações, grades, tabelas e diálogo de mapa a telas estreitas.
- `npm run build`, `npm run lint` e `git diff --check` devem passar antes da entrega. Avisos preexistentes do linter precisam ser registrados, mesmo quando não impedem a compilação.
