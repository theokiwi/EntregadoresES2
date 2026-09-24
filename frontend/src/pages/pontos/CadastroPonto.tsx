import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { mensagemDeErro } from '../../api/error';
import { criarPonto, listarPontos } from '../../api/pontos';
import { listarUnidades } from '../../api/unidades';
import { useAuth } from '../../auth/AuthContext';
import { Card, ErrorText, Field, inputClass, PrimaryButton, SuccessText } from '../../components/ui';

/** UC07 — Cadastrar ponto: TelaCadastroPonto. */
export function CadastroPonto() {
  const { sessao } = useAuth();
  const precisaSelecionarUnidade = !sessao?.unidadeId;

  const queryClient = useQueryClient();
  const unidades = useQuery({
    queryKey: ['unidades'],
    queryFn: listarUnidades,
    enabled: precisaSelecionarUnidade,
  });

  const [unidadeId, setUnidadeId] = useState('');
  const [endereco, setEndereco] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const unidadeConsultada = sessao?.unidadeId ?? unidadeId;
  const pontos = useQuery({
    queryKey: ['pontos', unidadeConsultada],
    queryFn: () => listarPontos(unidadeConsultada || undefined),
    enabled: Boolean(unidadeConsultada),
  });

  const mutation = useMutation({
    mutationFn: () =>
      criarPonto({
        endereco,
        latitude: Number(latitude),
        longitude: Number(longitude),
        unidadeId: precisaSelecionarUnidade ? unidadeId : undefined,
      }),
    onSuccess: () => {
      setSucesso(true);
      setEndereco('');
      setLatitude('');
      setLongitude('');
      queryClient.invalidateQueries({ queryKey: ['pontos'] });
    },
  });

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setSucesso(false);
    mutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="Novo ponto">
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
          <Field label="Endereço">
            <input required value={endereco} onChange={(e) => setEndereco(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Latitude">
            <input
              type="number"
              step="0.000001"
              min={-90}
              max={90}
              required
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Longitude">
            <input
              type="number"
              step="0.000001"
              min={-180}
              max={180}
              required
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className={inputClass}
            />
          </Field>
          {mutation.isError && <ErrorText>{mensagemDeErro(mutation.error)}</ErrorText>}
          {sucesso && <SuccessText>Ponto cadastrado.</SuccessText>}
          <PrimaryButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando…' : 'Cadastrar ponto'}
          </PrimaryButton>
        </form>
      </Card>

      <Card title="Pontos cadastrados">
        {!unidadeConsultada && <p className="text-sm text-slate-500">Selecione uma Unidade para listar.</p>}
        <ul className="flex flex-col gap-2 text-sm">
          {pontos.data?.map((ponto) => (
            <li key={ponto.id} className="rounded-md border border-slate-200 px-3 py-2">
              <p className="font-medium text-slate-800">{ponto.endereco}</p>
              <p className="text-slate-500">
                {ponto.latitude}, {ponto.longitude}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
