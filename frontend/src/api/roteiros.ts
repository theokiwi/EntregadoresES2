import { api } from './client';
import type { Roteiro } from './types';

export interface MontarRoteiroInput {
  entregadorId: string;
  data: string;
  pontoIds: string[];
  unidadeId?: string;
}

export async function montarRoteiro(input: MontarRoteiroInput): Promise<Roteiro> {
  const { data } = await api.post<Roteiro>('/roteiros', input);
  return data;
}

export async function consultarRoteiroDeHoje(): Promise<Roteiro | null> {
  const { data } = await api.get<{ roteiro: Roteiro | null }>('/roteiros/hoje');
  return data.roteiro;
}

export async function consultarRoteiroPorId(id: string): Promise<Roteiro> {
  const { data } = await api.get<Roteiro>(`/roteiros/${id}`);
  return data;
}
