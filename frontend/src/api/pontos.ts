import { api } from './client';
import type { Ponto } from './types';

export interface CriarPontoInput {
  endereco: string;
  latitude: number;
  longitude: number;
  unidadeId?: string;
}

export async function criarPonto(input: CriarPontoInput): Promise<Ponto> {
  const { data } = await api.post<Ponto>('/pontos', input);
  return data;
}

export async function listarPontos(unidadeId?: string): Promise<Ponto[]> {
  const { data } = await api.get<Ponto[]>('/pontos', { params: { unidadeId } });
  return data;
}
