import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { corrigirHorario } from '../../api/correcoes';
import { mensagemDeErro } from '../../api/error';
import { consultarRoteiroPorId } from '../../api/roteiros';
import type { ItemRoteiro } from '../../api/types';
import { Card, ErrorText, Field, inputClass, PrimaryButton, SuccessText } from '../../components/ui';

function paraInputDatetime(iso: string | null): string {
  if (!iso) return '';
  // datetime-local não aceita o "Z"/offset — corta para "YYYY-MM-DDTHH:mm".
  return new Date(iso).toISOString().slice(0, 16);
}

function FormularioCorrecao({ item, onConcluido }: { item: ItemRoteiro; onConcluido: () => void }) {
  const [campo, setCampo] = useState<'horaChegada' | 'horaSaida'>('horaChegada');
  const [novoValor, setNovoValor] = useState(paraInputDatetime(item.horaChegada));
  const [justificativa, setJustificativa] = useState('');

  const mutation = useMutation({
    mutationFn: () => corrigirHorario(item.id, { campo, novoValor: new Date(novoValor).toISOString(), justificativa }),
    onSuccess: () => {
      setJustificativa('');
      onConcluido();
    },
  });

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    mutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Campo">
          <select
            value={campo}
            onChange={(e) => {
              const novoCampo = e.target.value as 'horaChegada' | 'horaSaida';
              setCampo(novoCampo);
              setNovoValor(paraInputDatetime(novoCampo === 'horaChegada' ? item.horaChegada : item.horaSaida));
            }}
            className={inputClass}
          >
            <option value="horaChegada">Chegada</option>
            <option value="horaSaida">Saída</option>
          </select>
        </Field>
        <Field label="Novo horário">
          <input
            type="datetime-local"
            required
            value={novoValor}
            onChange={(e) => setNovoValor(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Justificativa">
        <textarea
          required
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          className={`${inputClass} min-h-16`}
        />
      </Field>
      {mutation.isError && <ErrorText>{mensagemDeErro(mutation.error)}</ErrorText>}
      <PrimaryButton type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Salvando…' : 'Salvar correção'}
      </PrimaryButton>
    </form>
  );
}

/** UC16 — Corrigir horário de chegada/saída: TelaCorrecaoDeRegistro. */
export function CorrigirHorario() {
  const queryClient = useQueryClient();
  const [roteiroIdBusca, setRoteiroIdBusca] = useState('');
  const [roteiroId, setRoteiroId] = useState('');
  const [itemEmEdicao, setItemEmEdicao] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const roteiro = useQuery({
    queryKey: ['roteiro', roteiroId],
    queryFn: () => consultarRoteiroPorId(roteiroId),
    enabled: Boolean(roteiroId),
  });

  function buscar(evento: FormEvent) {
    evento.preventDefault();
    setSucesso(false);
    setRoteiroId(roteiroIdBusca);
  }

  function aoConcluirCorrecao() {
    setItemEmEdicao(null);
    setSucesso(true);
    queryClient.invalidateQueries({ queryKey: ['roteiro', roteiroId] });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="Buscar roteiro">
        <form onSubmit={buscar} className="flex gap-2">
          <input
            required
            placeholder="ID do roteiro"
            value={roteiroIdBusca}
            onChange={(e) => setRoteiroIdBusca(e.target.value)}
            className={`${inputClass} flex-1`}
          />
          <PrimaryButton type="submit">Buscar</PrimaryButton>
        </form>
        {roteiro.isError && <ErrorText>{mensagemDeErro(roteiro.error)}</ErrorText>}
      </Card>

      {roteiro.data && (
        <Card title={`Roteiro de ${new Date(roteiro.data.data).toLocaleDateString('pt-BR')}`}>
          {sucesso && <SuccessText>Correção salva.</SuccessText>}
          <ol className="flex flex-col gap-2">
            {roteiro.data.itens.map((item) => (
              <li key={item.id} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-slate-800">
                    {item.ordem}. {item.ponto.endereco}
                  </p>
                  <button
                    type="button"
                    onClick={() => setItemEmEdicao(itemEmEdicao === item.id ? null : item.id)}
                    className="text-xs text-slate-600 underline"
                  >
                    Corrigir
                  </button>
                </div>
                <p className="text-slate-500">
                  Chegada: {item.horaChegada ? new Date(item.horaChegada).toLocaleString('pt-BR') : '—'} · Saída:{' '}
                  {item.horaSaida ? new Date(item.horaSaida).toLocaleString('pt-BR') : '—'} · Parado:{' '}
                  {item.tempoParadoMin ?? '—'} min
                </p>
                {itemEmEdicao === item.id && <FormularioCorrecao item={item} onConcluido={aoConcluirCorrecao} />}
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}
