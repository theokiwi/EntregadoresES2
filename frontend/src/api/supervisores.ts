import { api } from './client';
import type { UsuarioPublico } from './types';

export interface CriarSupervisorInput {
  nome: string;
  telefone?: string;
  email: string;
  unidadeId: string;
}

export async function criarSupervisor(input: CriarSupervisorInput): Promise<UsuarioPublico> {
  const { data } = await api.post<UsuarioPublico>('/supervisores', input);
  return data;
}
