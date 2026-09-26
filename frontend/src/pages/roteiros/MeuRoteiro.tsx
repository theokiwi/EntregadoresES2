import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mensagemDeErro } from '../../api/error';
import {
  consultarRoteiroDeHoje,
  finalizarRoteiro,
  iniciarRoteiro,
  registrarChegada,
  registrarSaida,
} from '../../api/roteiros';
import type { ItemRoteiro } from '../../api/types';
import { Card, EmptyState, ErrorText, Icon, PageHeader, PrimaryButton, StatusBadge } from '../../components/ui';

const ROTULO_STATUS: Record<string, string> = {
  PENDENTE: 'Pendente',
  AGUARDANDO_SAIDA: 'Aguardando saída',
  CONCLUIDO: 'Concluído',
};

/** UC10 (consulta) — UC11 a UC14 (execução): TelaRoteiroDoDia. */
export function MeuRoteiro() {
  const queryClient = useQueryClient();
  const roteiro = useQuery({ queryKey: ['roteiro-hoje'], queryFn: consultarRoteiroDeHoje });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['roteiro-hoje'] });
  const iniciarMutation = useMutation({ mutationFn: iniciarRoteiro, onSuccess: invalidar });
  const finalizarMutation = useMutation({ mutationFn: finalizarRoteiro, onSuccess: invalidar });
  const chegadaMutation = useMutation({ mutationFn: registrarChegada, onSuccess: invalidar });
  const saidaMutation = useMutation({ mutationFn: registrarSaida, onSuccess: invalidar });

  const erro = iniciarMutation.error ?? finalizarMutation.error ?? chegadaMutation.error ?? saidaMutation.error;
  const carregandoAcao =
    iniciarMutation.isPending || finalizarMutation.isPending || chegadaMutation.isPending || saidaMutation.isPending;

  if (roteiro.isLoading) {
    return (<><PageHeader eyebrow="Operação de hoje" title="Minha rota" description="Acompanhe sua sequência de entregas em tempo real." />
      <Card title="Carregando roteiro">
        <p className="text-sm text-slate-500">Carregando…</p>
      </Card></>);
  }

  if (!roteiro.data) {
    return (<><PageHeader eyebrow="Operação de hoje" title="Minha rota" description="Acompanhe sua sequência de entregas em tempo real."/><Card><EmptyState icon="route" title="Dia livre por aqui" description="Nenhum roteiro foi planejado para você hoje."/></Card></>);
  }

  const r = roteiro.data;
  const proximoPendente = r.itens.find((item) => item.status === 'PENDENTE');

  function acaoDoItem(item: ItemRoteiro) {
    if (r.status !== 'EM_ANDAMENTO') return null;
    if (item.status === 'PENDENTE' && proximoPendente?.id === item.id) {
      return (
        <PrimaryButton disabled={carregandoAcao} onClick={() => chegadaMutation.mutate(item.id)}>
          Registrar chegada
        </PrimaryButton>
      );
    }
    if (item.status === 'AGUARDANDO_SAIDA') {
      return (
        <PrimaryButton disabled={carregandoAcao} onClick={() => saidaMutation.mutate(item.id)}>
          Registrar saída
        </PrimaryButton>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader eyebrow="Operação de hoje" title="Minha rota" description={`${r.itens.length} pontos planejados para hoje`} />
      <div className="stats-grid !mb-0">
        <Card className="stat-card"><span className="stat-icon"><Icon name="pin"/></span><div><p>Pontos</p><strong>{r.itens.filter(i=>i.status==='CONCLUIDO').length}/{r.itens.length}</strong><small>concluídos</small></div></Card>
        <Card className="stat-card"><span className="stat-icon"><Icon name="clock"/></span><div><p>Tempo parado</p><strong>{r.itens.reduce((s,i)=>s+(i.tempoParadoMin??0),0)} min</strong></div></Card>
        <Card className="stat-card"><span className="stat-icon"><Icon name="route"/></span><div><p>Status atual</p><StatusBadge tone={r.status==='FINALIZADO'?'success':r.status==='EM_ANDAMENTO'?'warning':'neutral'}>{ROTULO_STATUS[r.status] ?? r.status}</StatusBadge></div></Card>
      </div>
      <Card title="Sequência de entregas" subtitle="Siga os pontos na ordem planejada">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-stone-400">Horário validado pelo servidor · localização GPS obrigatória no ponto</span>
          {r.status === 'NAO_INICIADO' && (
            <PrimaryButton disabled={carregandoAcao} onClick={() => iniciarMutation.mutate(r.id)}>
              Iniciar roteiro
            </PrimaryButton>
          )}
          {r.status === 'EM_ANDAMENTO' && (
            <PrimaryButton disabled={carregandoAcao} onClick={() => {
              if (window.confirm('Finalizar este roteiro? Depois de finalizado, os registros não poderão ser alterados por aqui.')) finalizarMutation.mutate(r.id);
            }}>
              Finalizar roteiro
            </PrimaryButton>
          )}
        </div>

        {erro && <ErrorText>{mensagemDeErro(erro)}</ErrorText>}

        <ol className="flex flex-col gap-2">
          {r.itens.map((item) => (
            <li
              key={item.id}
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${item.status==='AGUARDANDO_SAIDA'?'border-red-200 bg-red-50/40':'border-stone-200'}`}
            >
              <div>
                <p className="font-medium text-slate-800">
                  {item.ordem}. {item.ponto.endereco}
                </p>
                <p className="text-slate-500">
                  {item.ordem===1?'Ponto de partida':ROTULO_STATUS[item.status]}
                  {item.tempoParadoMin !== null && ` — parado ${item.tempoParadoMin} min`}
                </p>
              </div>
              {acaoDoItem(item)}
            </li>
          ))}
        </ol>
      </Card>

      {r.status === 'FINALIZADO' && (
        <Card title="Resumo do roteiro">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Tempo total parado</dt>
              <dd className="font-medium text-slate-800">{r.tempoTotalParadoMin} min</dd>
            </div>
            <div>
              <dt className="text-slate-500">Distância percorrida</dt>
              <dd className="font-medium text-slate-800">{Number(r.distanciaTotalKm).toFixed(2)} km</dd>
            </div>
            <div>
              <dt className="text-slate-500">Custo estimado</dt>
              <dd className="font-medium text-slate-800">R$ {Number(r.custoEstimado).toFixed(2)}</dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
