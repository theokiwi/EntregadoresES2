import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { mensagemDeErro } from '../../api/error';
import { atualizarJornada, consultarParametros } from '../../api/parametros';
import { Card, ErrorText, Field, inputClass, PrimaryButton, SuccessText } from '../../components/ui';

/** UC04 — Parametrizar jornada e regras de tempo parado: TelaParametrizarJornada. */
export function ParametrizarJornada({ unidadeId }: { unidadeId: string }) {
  const queryClient = useQueryClient();
  const parametro = useQuery({
    queryKey: ['parametros', unidadeId],
    queryFn: () => consultarParametros(unidadeId),
  });

  const [jornadaPadraoHoras, setJornadaPadraoHoras] = useState(8);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (parametro.data) setJornadaPadraoHoras(parametro.data.jornadaPadraoHoras);
  }, [parametro.data]);

  const mutation = useMutation({
    mutationFn: () => atualizarJornada(unidadeId, { jornadaPadraoHoras }),
    onSuccess: () => {
      setSucesso(true);
      queryClient.invalidateQueries({ queryKey: ['parametros', unidadeId] });
    },
  });

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setSucesso(false);
    mutation.mutate();
  }

  return (
    <Card title="Jornada padrão">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Jornada padrão (horas/dia, 1–24)">
          <input
            type="number"
            min={1}
            max={24}
            required
            value={jornadaPadraoHoras}
            onChange={(e) => setJornadaPadraoHoras(Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        {mutation.isError && <ErrorText>{mensagemDeErro(mutation.error)}</ErrorText>}
        {sucesso && <SuccessText>Jornada padrão atualizada.</SuccessText>}
        <PrimaryButton type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : 'Salvar jornada'}
        </PrimaryButton>
      </form>
    </Card>
  );
}
