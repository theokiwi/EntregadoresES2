import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { mensagemDeErro } from '../../api/error';
import { atribuirPerfil, buscarUsuarios } from '../../api/perfis';
import type { Perfil, UsuarioPublico } from '../../api/types';
import { listarUnidades } from '../../api/unidades';
import { Card, ErrorText, Field, inputClass, PrimaryButton, SuccessText } from '../../components/ui';

const PERFIS: { valor: Perfil; rotulo: string }[] = [
  { valor: 'ENTREGADOR', rotulo: 'Entregador' },
  { valor: 'SUPERVISOR_LOCAL', rotulo: 'Supervisor local' },
  { valor: 'SUPERVISOR_GERAL', rotulo: 'Supervisor geral' },
];

/** UC05 — Gerenciar perfis de acesso: TelaGerenciarPerfis. */
export function GerenciarPerfis() {
  const queryClient = useQueryClient();
  const unidades = useQuery({ queryKey: ['unidades'], queryFn: listarUnidades });

  const [busca, setBusca] = useState('');
  const [buscaAtiva, setBuscaAtiva] = useState('');
  const resultados = useQuery({
    queryKey: ['usuarios', buscaAtiva],
    queryFn: () => buscarUsuarios(buscaAtiva),
    enabled: buscaAtiva.length > 0,
  });

  const [selecionado, setSelecionado] = useState<UsuarioPublico | null>(null);
  const [perfil, setPerfil] = useState<Perfil>('ENTREGADOR');
  const [unidadeId, setUnidadeId] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      atribuirPerfil(selecionado!.id, { perfil, unidadeId: perfil === 'SUPERVISOR_GERAL' ? null : unidadeId }),
    onSuccess: (atualizado) => {
      setSucesso(true);
      setSelecionado(atualizado);
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  function handleBuscar(evento: FormEvent) {
    evento.preventDefault();
    setBuscaAtiva(busca);
  }

  function selecionar(usuario: UsuarioPublico) {
    setSelecionado(usuario);
    setPerfil(usuario.perfil);
    setUnidadeId(usuario.unidadeId ?? '');
    setSucesso(false);
  }

  function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setSucesso(false);
    mutation.mutate();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Buscar usuário">
        <form onSubmit={handleBuscar} className="flex gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome ou e-mail"
            className={`${inputClass} flex-1`}
          />
          <PrimaryButton type="submit">Buscar</PrimaryButton>
        </form>

        <ul className="mt-4 flex flex-col gap-2 text-sm">
          {resultados.data?.map((usuario) => (
            <li key={usuario.id}>
              <button
                onClick={() => selecionar(usuario)}
                className={`w-full rounded-md border px-3 py-2 text-left ${
                  selecionado?.id === usuario.id ? 'border-slate-900' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="font-medium text-slate-800">{usuario.nome}</p>
                <p className="text-slate-500">
                  {usuario.email} — {usuario.perfil}
                </p>
              </button>
            </li>
          ))}
          {buscaAtiva && resultados.data?.length === 0 && (
            <li className="text-slate-500">Nenhum usuário encontrado.</li>
          )}
        </ul>
      </Card>

      <Card title="Editar perfil">
        {!selecionado ? (
          <p className="text-sm text-slate-500">Selecione um usuário na busca.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-sm text-slate-700">
              <span className="font-medium">{selecionado.nome}</span> ({selecionado.email})
            </p>
            <Field label="Perfil">
              <select value={perfil} onChange={(e) => setPerfil(e.target.value as Perfil)} className={inputClass}>
                {PERFIS.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.rotulo}
                  </option>
                ))}
              </select>
            </Field>
            {perfil !== 'SUPERVISOR_GERAL' && (
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
            )}
            {mutation.isError && <ErrorText>{mensagemDeErro(mutation.error)}</ErrorText>}
            {sucesso && <SuccessText>Perfil atualizado.</SuccessText>}
            <PrimaryButton type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando…' : 'Salvar'}
            </PrimaryButton>
          </form>
        )}
      </Card>
    </div>
  );
}
