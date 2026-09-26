import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { exportarHistorico, consultarHistorico, consultarMeuHistorico } from '../api/historico';
import { listarEntregadores } from '../api/entregadores';
import { mensagemDeErro } from '../api/error';
import { useAuth } from '../auth/AuthContext';
import { Card, EmptyState, ErrorText, Field, Icon, inputClass, PageHeader, SecondaryButton, StatusBadge } from '../components/ui';

function iso(data: Date) { return data.toISOString().slice(0,10); }
function formatarData(valor: string) { return new Date(`${valor.slice(0,10)}T12:00:00`).toLocaleDateString('pt-BR'); }
function dinheiro(valor: string | null) { return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(valor ?? 0)); }

export function Historico() {
  const { sessao } = useAuth();
  const hoje = useMemo(() => new Date(), []);
  const trintaDias = useMemo(() => { const d=new Date(hoje); d.setDate(d.getDate()-30); return d; },[hoje]);
  const [dataInicial,setDataInicial]=useState(iso(trintaDias)); const [dataFinal,setDataFinal]=useState(iso(hoje)); const [entregadorId,setEntregadorId]=useState('');
  const entregador = sessao?.perfil === 'ENTREGADOR';
  const entregadores = useQuery({queryKey:['entregadores'],queryFn:()=>listarEntregadores(),enabled:!entregador});
  const filtros={dataInicial,dataFinal,...(entregadorId?{entregadorId}:{})};
  const historico=useQuery({queryKey:['historico',entregador,dataInicial,dataFinal,entregadorId],queryFn:()=>entregador?consultarMeuHistorico({dataInicial,dataFinal}):consultarHistorico(filtros)});
  const exportacao=useMutation({mutationFn:()=>exportarHistorico(filtros)});
  const roteiros=historico.data??[];

  return <>
    <PageHeader eyebrow="Rastreabilidade" title={entregador?'Meu histórico':'Histórico de rotas'} description={entregador?'Consulte suas entregas e resultados anteriores.':'Consulte pontos, tempos e custos de cada roteiro concluído.'} actions={!entregador?<SecondaryButton onClick={()=>exportacao.mutate()} disabled={!roteiros.length||exportacao.isPending}><Icon name="download" className="h-4 w-4"/>Exportar CSV</SecondaryButton>:undefined}/>
    <Card title="Filtros" className="mb-[18px]"><div className={`filter-row ${entregador?'md:grid-cols-[1fr_1fr_auto]':''}`}>
      <Field label="Data inicial"><input type="date" value={dataInicial} max={dataFinal} onChange={e=>setDataInicial(e.target.value)} className={inputClass}/></Field>
      <Field label="Data final"><input type="date" value={dataFinal} min={dataInicial} onChange={e=>setDataFinal(e.target.value)} className={inputClass}/></Field>
      {!entregador&&<Field label="Entregador"><select value={entregadorId} onChange={e=>setEntregadorId(e.target.value)} className={inputClass}><option value="">Todos</option>{entregadores.data?.map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</select></Field>}
    </div></Card>
    {(historico.isError||exportacao.isError)&&<ErrorText>{mensagemDeErro(historico.error??exportacao.error)}</ErrorText>}
    <Card title="Roteiros concluídos" subtitle={`${roteiros.length} resultado${roteiros.length===1?'':'s'} encontrado${roteiros.length===1?'':'s'}`}>
      {historico.isLoading?<p className="text-sm text-stone-400">Buscando histórico…</p>:!roteiros.length?<EmptyState icon="history" title="Nenhum roteiro encontrado" description="Ajuste o período ou aguarde a conclusão de novas rotas."/>:<div className="flex flex-col gap-3">{roteiros.map(r=><details key={r.id} className="group rounded-xl border border-stone-200 bg-white open:border-red-200">
        <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] items-center gap-4 p-4 [&::-webkit-details-marker]:hidden"><div className="flex flex-wrap items-center gap-x-5 gap-y-2"><div><span className="block text-[10px] font-bold uppercase tracking-wide text-stone-400">Data</span><strong className="text-sm text-stone-700">{formatarData(r.data)}</strong></div>{!entregador&&<div><span className="block text-[10px] font-bold uppercase tracking-wide text-stone-400">Entregador</span><strong className="text-sm text-stone-700">{r.entregador?.nome??'—'}</strong></div>}<div><span className="block text-[10px] font-bold uppercase tracking-wide text-stone-400">Resultado</span><span className="text-xs text-stone-600">{r.itens.length} pontos · {r.tempoTotalParadoMin??0} min · {Number(r.distanciaTotalKm??0).toFixed(1)} km · {dinheiro(r.custoEstimado)}</span></div><StatusBadge tone="success">Concluído</StatusBadge></div><Icon name="arrow" className="h-5 w-5 text-stone-400 transition group-open:rotate-90"/></summary>
        <div className="border-t border-stone-100 px-4 pb-4 pt-2"><div className="table-scroll"><table className="data-table"><thead><tr><th>#</th><th>Endereço</th><th>Chegada</th><th>Saída</th><th>Tempo parado</th></tr></thead><tbody>{r.itens.map(item=><tr key={item.id}><td>{item.ordem}</td><td><strong>{item.ponto.endereco}</strong></td><td>{item.horaChegada?new Date(item.horaChegada).toLocaleString('pt-BR'):'—'}</td><td>{item.horaSaida?new Date(item.horaSaida).toLocaleString('pt-BR'):'—'}</td><td>{item.ordem===1?'Partida':`${item.tempoParadoMin??0} min`}</td></tr>)}</tbody></table></div></div>
      </details>)}</div>}
    </Card>
  </>;
}
