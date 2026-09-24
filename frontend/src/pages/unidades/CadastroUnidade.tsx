import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { criarUnidade, listarUnidades } from '../../api/unidades';
import { mensagemDeErro } from '../../api/error';
import { Card, ErrorText, Field, inputClass, PrimaryButton, SuccessText } from '../../components/ui';

/** UC01 — Cadastrar unidade: TelaCadastroUnidade. */
export function CadastroUnidade() {
  const queryClient = useQueryClient();
  const unidades = useQuery({ queryKey: ['unidades'], queryFn: listarUnidades });

  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [fusoHorario, setFusoHorario] = useState('America/Sao_Paulo');
  const [sucesso, setSucesso] = useState(false);

  const mutation = useMutation({
    mutationFn: criarUnidade,
    onSuccess: () => {
      setSucesso(true);
      setNome('');
      setEndereco('');
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
    },
  });

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setSucesso(false);
    mutation.mutate({ nome, endereco, fusoHorario });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="Nova unidade">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nome">
            <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Endereço">
            <input required value={endereco} onChange={(e) => setEndereco(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Fuso horário">
            <input
              required
              value={fusoHorario}
              onChange={(e) => setFusoHorario(e.target.value)}
              className={inputClass}
            />
          </Field>
          {mutation.isError && <ErrorText>{mensagemDeErro(mutation.error)}</ErrorText>}
          {sucesso && <SuccessText>Unidade criada com sucesso.</SuccessText>}
          <PrimaryButton type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Salvando…' : 'Cadastrar unidade'}
          </PrimaryButton>
        </form>
      </Card>

      <Card title="Unidades cadastradas">
        {unidades.isLoading && <p className="text-sm text-slate-500">Carregando…</p>}
        <ul className="flex flex-col gap-2 text-sm">
          {unidades.data?.map((unidade) => (
            <li key={unidade.id} className="rounded-md border border-slate-200 px-3 py-2">
              <p className="font-medium text-slate-800">{unidade.nome}</p>
              <p className="text-slate-500">
                {unidade.endereco} — {unidade.fusoHorario}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
