import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { mensagemDeErro } from '../../api/error';
import { atualizarCustos, consultarParametros } from '../../api/parametros';
import { Card, ErrorText, Field, inputClass, PrimaryButton, SuccessText } from '../../components/ui';

/** UC03 — Parametrizar custos: TelaParametrizarCustos. */
export function ParametrizarCustos({ unidadeId }: { unidadeId: string }) {
  const queryClient = useQueryClient();
  const parametro = useQuery({
    queryKey: ['parametros', unidadeId],
    queryFn: () => consultarParametros(unidadeId),
  });

  const [valorCombustivel, setValorCombustivel] = useState('');
  const [custoPorKm, setCustoPorKm] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    setValorCombustivel(parametro.data?.valorCombustivel ?? '');
    setCustoPorKm(parametro.data?.custoPorKm ?? '');
  }, [parametro.data]);

  const mutation = useMutation({
    mutationFn: () =>
      atualizarCustos(unidadeId, { valorCombustivel: Number(valorCombustivel), custoPorKm: Number(custoPorKm) }),
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
    <Card title="Custos (combustível e custo/km)">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Valor do combustível (R$/L)">
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={valorCombustivel}
            onChange={(e) => setValorCombustivel(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Custo por km (R$)">
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={custoPorKm}
            onChange={(e) => setCustoPorKm(e.target.value)}
            className={inputClass}
          />
        </Field>
        {mutation.isError && <ErrorText>{mensagemDeErro(mutation.error)}</ErrorText>}
        {sucesso && <SuccessText>Custos atualizados.</SuccessText>}
        <PrimaryButton type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : 'Salvar custos'}
        </PrimaryButton>
      </form>
    </Card>
  );
}
