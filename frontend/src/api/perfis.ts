import { api } from './client';
import type { Perfil, UsuarioPublico } from './types';

export async function buscarUsuarios(busca: string): Promise<UsuarioPublico[]> {
  const { data } = await api.get<UsuarioPublico[]>('/usuarios', { params: { busca } });
  return data;
}

export async function atribuirPerfil(
  usuarioId: string,
  input: { perfil: Perfil; unidadeId: string | null },
): Promise<UsuarioPublico> {
  const { data } = await api.patch<UsuarioPublico>(`/usuarios/${usuarioId}/perfil`, input);
  return data;
}
