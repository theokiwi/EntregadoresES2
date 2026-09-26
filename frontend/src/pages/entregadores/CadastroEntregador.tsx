import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { mensagemDeErro } from '../../api/error';
import { criarEntregador, listarEntregadores } from '../../api/entregadores';
import { listarUnidades } from '../../api/unidades';
import { useAuth } from '../../auth/AuthContext';
import { Card, ErrorText, Field, inputClass, PrimaryButton, SuccessText } from '../../components/ui';

/** UC06 — Cadastrar entregador: TelaCadastroEntregador. */
export function CadastroEntregador() {
  const { sessao } = useAuth();
  const precisaSelecionarUnidade = !sessao?.unidadeId;

  const queryClient = useQueryClient();
  const unidades = useQuery({
    queryKey: ['unidades'],
    queryFn: listarUnidades,
    enabled: precisaSelecionarUnidade,
  });

  const [unidadeId, setUnidadeId] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [documento, setDocumento] = useState('');
  const [veiculo, setVeiculo] = useState('');
  const [tipoCombustivel, setTipoCombustivel] = useState<'GASOLINA' | 'DIESEL'>('GASOLINA');
  const [rendimentoKmLitro, setRendimentoKmLitro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const unidadeConsultada = sessao?.unidadeId ?? unidadeId;
  const entregadores = useQuery({
    queryKey: ['entregadores', unidadeConsultada],
    queryFn: () => listarEntregadores(unidadeConsultada || undefined),
    enabled: Boolean(unidadeConsultada),
  });

  const mutation = useMutation({
    mutationFn: () =>
      criarEntregador({
        nome,
        telefone,
        documento,
        veiculo,
        tipoCombustivel,
        rendimentoKmLitro: Number(rendimentoKmLitro),
        unidadeId: precisaSelecionarUnidade ? unidadeId : undefined,
      }),
    onSuccess: () => {
      setSucesso(true);
      setNome('');
      setTelefone('');
      setDocumento('');
      setVeiculo('');
      setRendimentoKmLitro('');
      queryClient.invalidateQueries({ queryKey: ['entregadores'] });
    },
  });

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setSucesso(false);
    mutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="Novo entregador">
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
          <Field label="Nome">
            <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Telefone (DD) 9XXXX-XXXX">
            <input
              required
              placeholder="(31) 91234-5678"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="CPF">
            <input
              required
              placeholder="111.111.111-11"
              value={documento}
              onChange={(e) => setDocumento(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Veículo">
            <input required value={veiculo} onChange={(e) => setVeiculo(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Rendimento (km/L)">
            <select aria-label="Tipo de combustível" value={tipoCombustivel} onChange={(e) => setTipoCombustivel(e.target.value as 'GASOLINA' | 'DIESEL')} className={`${inputClass} mb-2`}><option value="GASOLINA">Gasolina</option><option value="DIESEL">Diesel</option></select>
            <input
              type="number"
              step="0.1"
              min="0.1"
              required
              value={rendimentoKmLitro}
              onChange={(e) => setRendimentoKmLitro(e.target.value)}
              className={inputClass}
            />
          </Field>
          {mutation.isError && <ErrorText>{mensagemDeErro(mutation.error)}</ErrorText>}
          {sucesso && <SuccessText>Entregador cadastrado.</SuccessText>}
          <PrimaryButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando…' : 'Cadastrar entregador'}
          </PrimaryButton>
        </form>
      </Card>

      <Card title="Entregadores cadastrados">
        {!unidadeConsultada && <p className="text-sm text-stone-500">Selecione uma unidade para listar.</p>}
        <ul className="flex flex-col gap-2 text-sm">
          {entregadores.data?.map((entregador) => (
            <li key={entregador.id} className="rounded-md border border-slate-200 px-3 py-2">
              <p className="font-medium text-slate-800">{entregador.nome}</p>
              <p className="text-slate-500">
                {entregador.veiculo} — {entregador.tipoCombustivel === 'DIESEL' ? 'diesel' : 'gasolina'} — {entregador.rendimentoKmLitro} km/L — {entregador.documento}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
