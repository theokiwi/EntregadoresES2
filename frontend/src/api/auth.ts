import { api } from './client';
import type { Sessao } from './types';

export async function login(email: string, senha: string): Promise<Sessao> {
  const { data } = await api.post<Sessao>('/auth/login', { email, senha });
  return data;
}

export async function definirSenha(token: string, novaSenha: string): Promise<void> {
  await api.post('/auth/definir-senha', { token, novaSenha });
}
