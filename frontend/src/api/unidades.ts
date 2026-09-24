import { api } from './client';
import type { Unidade } from './types';

export async function listarUnidades(): Promise<Unidade[]> {
  const { data } = await api.get<Unidade[]>('/unidades');
  return data;
}

export interface CriarUnidadeInput {
  nome: string;
  endereco: string;
  fusoHorario: string;
}

export async function criarUnidade(input: CriarUnidadeInput): Promise<Unidade> {
  const { data } = await api.post<Unidade>('/unidades', input);
  return data;
}
