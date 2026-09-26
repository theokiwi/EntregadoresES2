import { useMutation, useQuery } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { mensagemDeErro } from '../../api/error';
import { criarSupervisor } from '../../api/supervisores';
import { listarUnidades } from '../../api/unidades';
import { Card, ErrorText, Field, inputClass, PrimaryButton, SuccessText } from '../../components/ui';

/** UC02 — Cadastrar supervisor local: TelaCadastroSupervisor. */
export function CadastroSupervisor() {
  const unidades = useQuery({ queryKey: ['unidades'], queryFn: listarUnidades });

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [unidadeId, setUnidadeId] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const mutation = useMutation({
    mutationFn: criarSupervisor,
    onSuccess: () => {
      setSucesso(true);
      setNome('');
      setTelefone('');
      setEmail('');
    },
  });

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setSucesso(false);
    mutation.mutate({ nome, telefone: telefone || undefined, email, unidadeId });
  }

  return (
    <Card title="Novo supervisor local">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nome">
          <input required value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Telefone">
          <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className={inputClass} />
        </Field>
        <Field label="E-mail">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Unidade">
          <select
            required
            value={unidadeId}
            onChange={(e) => setUnidadeId(e.target.value)}
            className={inputClass}
          >
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
        {mutation.isError && <ErrorText>{mensagemDeErro(mutation.error)}</ErrorText>}
        {sucesso && <SuccessText>Supervisor cadastrado. Convite enviado por e-mail.</SuccessText>}
        <PrimaryButton type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Salvando…' : 'Cadastrar supervisor'}
        </PrimaryButton>
      </form>
    </Card>
  );
}
