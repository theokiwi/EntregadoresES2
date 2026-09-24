import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { listarEntregadores } from '../../api/entregadores';
import { mensagemDeErro } from '../../api/error';
import { listarPontos } from '../../api/pontos';
import { montarRoteiro } from '../../api/roteiros';
import { listarUnidades } from '../../api/unidades';
import { useAuth } from '../../auth/AuthContext';
import { Card, ErrorText, Field, inputClass, PrimaryButton, SuccessText } from '../../components/ui';

/** UC09 — Montar roteiro diário: TelaMontarRoteiro. */
export function MontarRoteiro() {
  const { sessao } = useAuth();
  const precisaSelecionarUnidade = !sessao?.unidadeId;

  const unidades = useQuery({ queryKey: ['unidades'], queryFn: listarUnidades, enabled: precisaSelecionarUnidade });
  const [unidadeId, setUnidadeId] = useState('');
  const unidadeAlvo = sessao?.unidadeId ?? unidadeId;

  const entregadores = useQuery({
    queryKey: ['entregadores', unidadeAlvo],
    queryFn: () => listarEntregadores(unidadeAlvo || undefined),
    enabled: Boolean(unidadeAlvo),
  });
  const pontos = useQuery({
    queryKey: ['pontos', unidadeAlvo],
    queryFn: () => listarPontos(unidadeAlvo || undefined),
    enabled: Boolean(unidadeAlvo),
  });

  const [entregadorId, setEntregadorId] = useState('');
  const [data, setData] = useState('');
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [sucesso, setSucesso] = useState(false);

  const pontosDisponiveis = (pontos.data ?? []).filter((ponto) => !selecionados.includes(ponto.id));

  function adicionarPonto(pontoId: string) {
    setSelecionados((atual) => [...atual, pontoId]);
  }
  function removerPonto(pontoId: string) {
    setSelecionados((atual) => atual.filter((id) => id !== pontoId));
  }
  function moverPonto(indice: number, direcao: -1 | 1) {
    setSelecionados((atual) => {
      const novo = [...atual];
      const alvo = indice + direcao;
      if (alvo < 0 || alvo >= novo.length) return novo;
      [novo[indice], novo[alvo]] = [novo[alvo], novo[indice]];
      return novo;
    });
  }

  const mutation = useMutation({
    mutationFn: () =>
      montarRoteiro({
        entregadorId,
        data,
        pontoIds: selecionados,
        unidadeId: precisaSelecionarUnidade ? unidadeId : undefined,
      }),
    onSuccess: () => {
      setSucesso(true);
      setSelecionados([]);
    },
  });

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setSucesso(false);
    mutation.mutate();
  }

  function enderecoDoPonto(pontoId: string) {
    return pontos.data?.find((p) => p.id === pontoId)?.endereco ?? pontoId;
  }

  return (
    <Card title="Montar roteiro diário">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {precisaSelecionarUnidade && (
          <Field label="Unidade">
            <select required value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)} className={inputClass}>
              <option value="" disabled>
                Selecione…
              </option>
              {unidades.data?.map((unidade) => (
                <option key={unidade.id} value={unidade.id}>
                  {unidade.nome}
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Entregador">
            <select
              required
              value={entregadorId}
              onChange={(e) => setEntregadorId(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Selecione…
              </option>
              {entregadores.data?.map((entregador) => (
                <option key={entregador.id} value={entregador.id}>
                  {entregador.nome}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data">
            <input type="date" required value={data} onChange={(e) => setData(e.target.value)} className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Pontos disponíveis</p>
            <ul className="flex flex-col gap-1">
              {pontosDisponiveis.map((ponto) => (
                <li key={ponto.id}>
                  <button
                    type="button"
                    onClick={() => adicionarPonto(ponto.id)}
                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-left text-sm hover:bg-slate-50"
                  >
                    + {ponto.endereco}
                  </button>
                </li>
              ))}
              {pontosDisponiveis.length === 0 && <li className="text-sm text-slate-500">Nenhum ponto disponível.</li>}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Ordem do roteiro (1º é o ponto de partida, sem tempo parado — RN01)
            </p>
            <ol className="flex flex-col gap-1">
              {selecionados.map((pontoId, indice) => (
                <li
                  key={pontoId}
                  className="flex items-center justify-between rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm"
                >
                  <span>
                    {indice + 1}. {enderecoDoPonto(pontoId)}
                  </span>
                  <span className="flex gap-1">
                    <button type="button" onClick={() => moverPonto(indice, -1)} className="px-1 text-slate-500">
                      ↑
                    </button>
                    <button type="button" onClick={() => moverPonto(indice, 1)} className="px-1 text-slate-500">
                      ↓
                    </button>
                    <button type="button" onClick={() => removerPonto(pontoId)} className="px-1 text-red-600">
                      ×
                    </button>
                  </span>
                </li>
              ))}
              {selecionados.length === 0 && <li className="text-sm text-slate-500">Nenhum ponto selecionado.</li>}
            </ol>
          </div>
        </div>

        {mutation.isError && <ErrorText>{mensagemDeErro(mutation.error)}</ErrorText>}
        {sucesso && <SuccessText>Roteiro criado com status "Não iniciado".</SuccessText>}
        <PrimaryButton type="submit" disabled={mutation.isPending || selecionados.length === 0}>
          {mutation.isPending ? 'Salvando…' : 'Montar roteiro'}
        </PrimaryButton>
      </form>
    </Card>
  );
}
