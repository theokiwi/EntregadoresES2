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
import { Card, ErrorText, PrimaryButton } from '../../components/ui';

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
    return (
      <Card title="Meu roteiro do dia">
        <p className="text-sm text-slate-500">Carregando…</p>
      </Card>
    );
  }

  if (!roteiro.data) {
    return (
      <Card title="Meu roteiro do dia">
        <p className="text-sm text-slate-500">Nenhum roteiro disponível para hoje.</p>
      </Card>
    );
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
      <Card title="Meu roteiro do dia">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-700">Status: {ROTULO_STATUS[r.status] ?? r.status}</span>
          {r.status === 'NAO_INICIADO' && (
            <PrimaryButton disabled={carregandoAcao} onClick={() => iniciarMutation.mutate(r.id)}>
              Iniciar roteiro
            </PrimaryButton>
          )}
          {r.status === 'EM_ANDAMENTO' && (
            <PrimaryButton disabled={carregandoAcao} onClick={() => finalizarMutation.mutate(r.id)}>
              Finalizar roteiro
            </PrimaryButton>
          )}
        </div>

        {erro && <ErrorText>{mensagemDeErro(erro)}</ErrorText>}

        <ol className="flex flex-col gap-2">
          {r.itens.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {item.ordem}. {item.ponto.endereco}
                </p>
                <p className="text-slate-500">
                  {ROTULO_STATUS[item.status]}
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
