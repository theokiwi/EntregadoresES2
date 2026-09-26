import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { mensagemDeErro } from '../../api/error';
import { consultarRoteiroPorId } from '../../api/roteiros';
import { Card, EmptyState, ErrorText, Field, Icon, inputClass, PageHeader, PrimaryButton, StatusBadge } from '../../components/ui';

function moeda(valor: string | null) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor ?? 0));
}

/** UC20 — consulta os valores persistidos por UC23, sem recalcular no cliente. */
export function CustoRoteiro() {
  const [busca, setBusca] = useState('');
  const [id, setId] = useState('');
  const roteiro = useQuery({ queryKey: ['custo-roteiro', id], queryFn: () => consultarRoteiroPorId(id), enabled: Boolean(id) });
  function consultar(evento: FormEvent) { evento.preventDefault(); setId(busca.trim()); }

  return <>
    <PageHeader eyebrow="Análise financeira" title="Custos de rota" description="Consulte a distância e o custo estimado já calculados na finalização."/>
    <Card title="Localizar roteiro" subtitle="Use o identificador exibido nos relatórios e registros da operação" className="mb-[18px]">
      <form onSubmit={consultar} className="flex items-end gap-3 max-sm:flex-col"><Field label="ID do roteiro"><input required value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Informe o identificador" className={inputClass}/></Field><PrimaryButton type="submit" className="max-sm:w-full">Consultar custo</PrimaryButton></form>
      {roteiro.isError&&<div className="mt-3"><ErrorText>{mensagemDeErro(roteiro.error)}</ErrorText></div>}
    </Card>
    {!id?<Card><EmptyState icon="money" title="Consulte uma rota" description="Os valores são apresentados exatamente como foram persistidos ao concluir o roteiro."/></Card>:roteiro.isLoading?<Card><p className="text-sm text-stone-400">Buscando dados da rota…</p></Card>:roteiro.data&&roteiro.data.status!=='FINALIZADO'?<Card><EmptyState icon="clock" title="Custo ainda indisponível" description="O custo e a distância serão calculados automaticamente após a finalização de todos os pontos da rota."/></Card>:roteiro.data&&<>
      <div className="stats-grid"><Card className="stat-card"><span className="stat-icon"><Icon name="money"/></span><div><p>Custo estimado</p><strong>{moeda(roteiro.data.custoEstimado)}</strong><small>valor persistido</small></div></Card><Card className="stat-card"><span className="stat-icon"><Icon name="distance"/></span><div><p>Distância total</p><strong>{Number(roteiro.data.distanciaTotalKm??0).toFixed(2)} km</strong></div></Card><Card className="stat-card"><span className="stat-icon"><Icon name="clock"/></span><div><p>Tempo parado</p><strong>{roteiro.data.tempoTotalParadoMin??0} min</strong></div></Card></div>
      <Card title="Resumo da rota"><div className="flex flex-wrap items-center justify-between gap-4 text-sm"><div><p className="text-stone-400">Data da operação</p><strong>{new Date(`${roteiro.data.data.slice(0,10)}T12:00:00`).toLocaleDateString('pt-BR')}</strong></div><div><p className="text-stone-400">Pontos atendidos</p><strong>{roteiro.data.itens.length}</strong></div><StatusBadge tone="success">Finalizado</StatusBadge></div></Card>
    </>}
  </>;
}
