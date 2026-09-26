import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { consultarDashboard, exportarDashboard } from '../api/dashboard';
import { mensagemDeErro } from '../api/error';
import { listarUnidades } from '../api/unidades';
import { useAuth } from '../auth/AuthContext';
import { Card, EmptyState, ErrorText, Field, Icon, inputClass, PageHeader, SecondaryButton } from '../components/ui';
import { MeuRoteiro } from './roteiros/MeuRoteiro';
import { MeuRanking } from './entregadores/MeuRanking';

function dataInput(data: Date) { return data.toISOString().slice(0, 10); }
function dataPt(valor: string) { return new Date(`${valor.slice(0,10)}T12:00:00`).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}); }
const numero = (valor: number, casas = 1) => valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
const moeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
function ranking<T extends { rotasConcluidas: number; distanciaKm: number; tempoParadoMin: number; custoCombustivel: number }>(itens: T[]) {
  const max = (campo: (item: T) => number) => Math.max(...itens.map(campo), 1);
  const maxRotas = max((x) => x.rotasConcluidas), maxKm = max((x) => x.distanciaKm);
  const maxParado = max((x) => x.tempoParadoMin / Math.max(x.rotasConcluidas, 1));
  const maxCustoKm = max((x) => x.custoCombustivel / Math.max(x.distanciaKm, 1));
  return itens.map((item) => ({ ...item, pontuacao: item.rotasConcluidas === 0 ? 0 : Math.round(100 * (.4 * item.rotasConcluidas / maxRotas + .3 * item.distanciaKm / maxKm + .2 * (1 - (item.tempoParadoMin / item.rotasConcluidas) / maxParado) + .1 * (1 - (item.custoCombustivel / Math.max(item.distanciaKm, 1)) / maxCustoKm))) })).sort((a,b) => b.pontuacao - a.pontuacao);
}

export function Painel() {
  const { sessao } = useAuth();
  const hoje = useMemo(() => new Date(), []);
  const inicioMes = useMemo(() => new Date(hoje.getFullYear(), hoje.getMonth(), 1), [hoje]);
  const [dataInicial, setDataInicial] = useState(dataInput(inicioMes));
  const [dataFinal, setDataFinal] = useState(dataInput(hoje));
  const [unidadeId, setUnidadeId] = useState('');
  const [escala, setEscala] = useState<'diaria'|'semanal'|'mensal'|'anual'>('diaria');
  const filtros = { dataInicial, dataFinal, unidadeId: unidadeId || undefined };
  const unidades = useQuery({ queryKey: ['unidades'], queryFn: listarUnidades, enabled: sessao?.perfil === 'SUPERVISOR_GERAL' });
  const dashboard = useQuery({ queryKey: ['dashboard', filtros], queryFn: () => consultarDashboard(filtros), enabled: sessao?.perfil !== 'ENTREGADOR' });
  const exportacao = useMutation({ mutationFn: () => exportarDashboard(filtros) });

  if (sessao?.perfil === 'ENTREGADOR') return <><MeuRanking /><MeuRoteiro /></>;
  const itens = dashboard.data?.roteiros ?? [];
  const resumo = dashboard.data?.resumo;
  const serie = dashboard.data?.series[escala] ?? [];
  const maximo = Math.max(...serie.map((item) => item.rotasConcluidas), 1);
  const rankingUnidades = ranking(dashboard.data?.porUnidade ?? []);
  const rankingEntregadores = ranking(dashboard.data?.porEntregador ?? []);
  const unidadeDestaque = rankingUnidades.find((item) => item.rotasConcluidas > 0);
  const entregadorDestaque = rankingEntregadores.find((item) => item.rotasConcluidas > 0);
  const escalas = { diaria: 'Dia', semanal: 'Semana', mensal: 'Mês', anual: 'Ano' } as const;

  return <>
    <PageHeader eyebrow="Inteligência operacional" title={`Olá, ${sessao?.nome.split(' ')[0] ?? 'Supervisor'}!`} description="Compare unidades, equipes, produtividade e consumo da frota." actions={<SecondaryButton onClick={() => exportacao.mutate()} disabled={!itens.length || exportacao.isPending}><Icon name="download" className="h-4 w-4"/>Exportar relatório completo</SecondaryButton>} />
    <div className="stats-grid report-stats">
      <Card className="stat-card"><span className="stat-icon"><Icon name="route"/></span><div><p>Rotas concluídas</p><strong>{resumo?.rotasConcluidas ?? 0}</strong><small>{numero(resumo?.distanciaKm ?? 0)} km</small></div></Card>
      <Card className="stat-card"><span className="stat-icon"><Icon name="clock"/></span><div><p>Tempo parado</p><strong>{numero((resumo?.tempoParadoMin ?? 0) / 60)}h</strong><small>{Math.round(dashboard.data?.media ?? 0)} min/rota</small></div></Card>
      <Card className="stat-card"><span className="stat-icon"><Icon name="chart"/></span><div><p>Combustível estimado</p><strong>{numero(resumo?.litrosConsumidos ?? 0)} L</strong><small>{moeda(resumo?.custoCombustivel ?? 0)}</small></div></Card>
      <Card className="stat-card"><span className="stat-icon"><Icon name="check"/></span><div><p>Resultado financeiro</p><strong className="result-pending">{dashboard.data?.financeiro.lucro === null || dashboard.data?.financeiro.lucro === undefined ? 'Pendente' : moeda(dashboard.data.financeiro.lucro)}</strong><small>{dashboard.data?.financeiro.lucro === null || dashboard.data?.financeiro.lucro === undefined ? 'receita incompleta' : dashboard.data.financeiro.lucro >= 0 ? 'lucro no período' : 'prejuízo no período'}</small></div></Card>
    </div>
    <div className="monthly-highlights"><Card className="winner-card"><span className="winner-trophy">★</span><div><p>Unidade do período</p><strong>{unidadeDestaque?.unidadeNome ?? 'Sem dados'}</strong><small>{unidadeDestaque ? `${unidadeDestaque.pontuacao} pontos · ${unidadeDestaque.rotasConcluidas} rotas` : 'Conclua rotas para gerar o destaque'}</small></div></Card><Card className="winner-card"><span className="winner-trophy">★</span><div><p>Funcionário do período</p><strong>{entregadorDestaque?.entregadorNome ?? 'Sem dados'}</strong><small>{entregadorDestaque ? `${entregadorDestaque.pontuacao} pontos · ${entregadorDestaque.unidadeNome}` : 'Conclua rotas para gerar o destaque'}</small></div></Card></div>
    <Card className="mb-[18px]" title="Período e unidade do relatório" subtitle="Defina quais dados serão considerados em todos os indicadores e gráficos abaixo.">
      <div className="report-filter-row"><Field label="Data inicial"><input type="date" value={dataInicial} max={dataFinal} onChange={(e) => setDataInicial(e.target.value)} className={inputClass}/></Field><Field label="Data final"><input type="date" value={dataFinal} min={dataInicial} onChange={(e) => setDataFinal(e.target.value)} className={inputClass}/></Field>{sessao?.perfil === 'SUPERVISOR_GERAL' && <Field label="Unidade"><select value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)} className={inputClass}><option value="">Todas as unidades</option>{unidades.data?.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}</select></Field>}</div>
    </Card>
    {(dashboard.isError || exportacao.isError) && <ErrorText>{mensagemDeErro(dashboard.error ?? exportacao.error)}</ErrorText>}
    <div className="dashboard-grid">
      <Card title="Evolução da operação" subtitle="Rotas concluídas dentro do período selecionado acima.">
        <div className="chart-grouping">
          <span>Agrupar dados por</span>
          <div className="scale-tabs" role="group" aria-label="Agrupar dados do gráfico por">{(['diaria','semanal','mensal','anual'] as const).map((item) => <button type="button" className={escala === item ? 'active' : ''} aria-pressed={escala === item} key={item} onClick={() => setEscala(item)}>{escalas[item]}</button>)}</div>
          <small>Cada barra representa um intervalo do agrupamento selecionado.</small>
        </div>
        {dashboard.isLoading ? <p className="text-sm text-stone-400" role="status">Carregando indicadores…</p> : !serie.length ? <EmptyState icon="chart" title="Nenhum dado no período" description="Quando as rotas forem concluídas, os indicadores aparecerão aqui."/> : <div className="chart" aria-label="Gráfico de rotas concluídas">{serie.slice(-16).map((item) => <div className="chart-item" key={item.periodo} title={`${item.rotasConcluidas} rotas; ${numero(item.distanciaKm)} km`}><span className="chart-value">{item.rotasConcluidas}</span><div className="chart-bar" aria-hidden="true" style={{height:`${Math.max((item.rotasConcluidas/maximo)*82,3)}%`}}/><span className="chart-label">{escala === 'diaria' ? dataPt(item.periodo) : item.periodo}</span></div>)}</div>}
      </Card>
      <Card title="Custos e rentabilidade" subtitle="Leitura financeira do período"><dl className="finance-list"><div><dt>Custo de combustível</dt><dd>{moeda(resumo?.custoCombustivel ?? 0)}</dd></div><div><dt>Receita bruta</dt><dd>{dashboard.data?.financeiro.receitaBruta === null || dashboard.data?.financeiro.receitaBruta === undefined ? 'Não informada' : moeda(dashboard.data.financeiro.receitaBruta)}</dd></div><div><dt>Lucro / prejuízo</dt><dd>{dashboard.data?.financeiro.lucro === null || dashboard.data?.financeiro.lucro === undefined ? 'Não calculável' : moeda(dashboard.data.financeiro.lucro)}</dd></div></dl>{dashboard.data?.financeiro.motivoIndisponibilidade && <p className="data-note">{dashboard.data.financeiro.motivoIndisponibilidade}</p>}</Card>
    </div>
    <div className="comparison-grid"><Card title="Ranking de unidades" subtitle="Comparação visual pelo índice de desempenho">{rankingUnidades.length ? <ol className="ranking-list">{rankingUnidades.map((item, i) => <li key={item.unidadeId}><span className="ranking-position">{i+1}</span><div><strong>{item.unidadeNome}</strong><span><i style={{width:`${item.pontuacao}%`}}/></span></div><b>{item.pontuacao}</b></li>)}</ol> : <EmptyState icon="chart" title="Sem dados" description="Nenhuma unidade para comparar."/>}</Card><Card title="Ranking de entregadores" subtitle="Comparação visual pelo índice de desempenho">{rankingEntregadores.length ? <ol className="ranking-list">{rankingEntregadores.map((item, i) => <li key={item.entregadorId}><span className="ranking-position">{i+1}</span><div><strong>{item.entregadorNome}</strong><small>{item.unidadeNome}</small><span><i style={{width:`${item.pontuacao}%`}}/></span></div><b>{item.pontuacao}</b></li>)}</ol> : <EmptyState icon="chart" title="Sem dados" description="Nenhum entregador para comparar."/>}</Card></div>
    <p className="ranking-method">Índice de desempenho: 40% rotas concluídas, 30% distância percorrida, 20% menor tempo parado por rota e 10% menor custo por km. A pontuação é relativa aos participantes do filtro atual.</p>
    <Card className="mb-[18px]" title={`Evolução ${escala} por participante`} subtitle="Compare a quantidade de rotas de cada unidade e entregador ao longo do tempo"><div className="entity-trends"><section><h3>Unidades</h3>{rankingUnidades.map((item) => <div className="trend-row" key={item.unidadeId}><strong>{item.unidadeNome}</strong><div>{item.series[escala].map((p) => <span key={p.periodo} title={`${p.periodo}: ${p.rotasConcluidas} rotas`} style={{height:`${Math.max(4, Math.min(30, p.rotasConcluidas * 6))}px`}}/>)}</div><small>{item.rotasConcluidas} rotas</small></div>)}</section><section><h3>Entregadores</h3>{rankingEntregadores.map((item) => <div className="trend-row" key={item.entregadorId}><strong>{item.entregadorNome}</strong><div>{item.series[escala].map((p) => <span key={p.periodo} title={`${p.periodo}: ${p.rotasConcluidas} rotas`} style={{height:`${Math.max(4, Math.min(30, p.rotasConcluidas * 6))}px`}}/>)}</div><small>{item.rotasConcluidas} rotas</small></div>)}</section></div></Card>
    <Card className="mt-[18px]" title="Desempenho por unidade" subtitle="Visão consolidada e composição de cada equipe">
      {!dashboard.data?.porUnidade.length ? <EmptyState icon="route" title="Sem unidades com atividade" description="A tabela será preenchida com rotas concluídas no período."/> : <div className="report-table-wrap"><table className="report-table"><thead><tr><th>Unidade</th><th>Entregadores</th><th>Rotas</th><th>Distância</th><th>Combustível</th><th>Custo</th><th>Parado</th></tr></thead><tbody>{dashboard.data.porUnidade.map((u) => <tr key={u.unidadeId}><td><strong>{u.unidadeNome}</strong></td><td>{u.entregadores.map((e) => e.entregadorNome).join(', ')}</td><td>{u.rotasConcluidas}</td><td>{numero(u.distanciaKm)} km</td><td>{numero(u.litrosConsumidos)} L</td><td>{moeda(u.custoCombustivel)}</td><td>{Math.round(u.tempoParadoMin / Math.max(u.rotasConcluidas,1))} min/rota</td></tr>)}</tbody></table></div>}
    </Card>
    <Card className="mt-[18px]" title="Desempenho por entregador" subtitle="Produtividade, veículo e consumo estimado individual">
      {!dashboard.data?.porEntregador.length ? <EmptyState icon="chart" title="Sem entregadores com atividade" description="A tabela será preenchida com rotas concluídas no período."/> : <div className="report-table-wrap"><table className="report-table"><thead><tr><th>Entregador</th><th>Unidade / veículo</th><th>Rotas</th><th>Distância</th><th>Consumo</th><th>Custo</th><th>Tempo médio</th></tr></thead><tbody>{dashboard.data.porEntregador.map((e) => <tr key={e.entregadorId}><td><strong>{e.entregadorNome}</strong></td><td>{e.unidadeNome}<small>{e.veiculo ?? 'Veículo não informado'} · {e.tipoCombustivel === 'DIESEL' ? 'diesel' : e.tipoCombustivel === 'GASOLINA' ? 'gasolina' : 'combustível não informado'} · {numero(e.rendimentoKmLitro)} km/L</small></td><td>{e.rotasConcluidas}</td><td>{numero(e.distanciaKm)} km</td><td>{numero(e.litrosConsumidos)} L</td><td>{moeda(e.custoCombustivel)}</td><td>{e.duracaoMediaMin === null ? '—' : `${Math.round(e.duracaoMediaMin)} min`}</td></tr>)}</tbody></table></div>}
    </Card>
  </>;
}
