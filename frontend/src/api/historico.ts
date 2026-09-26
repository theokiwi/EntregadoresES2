import { api } from './client';
import { baixar } from './dashboard';
import type { Roteiro } from './types';

export interface FiltrosHistorico {
  dataInicial: string;
  dataFinal: string;
  entregadorId?: string;
  unidadeId?: string;
}

export async function consultarHistorico(filtros: FiltrosHistorico): Promise<Roteiro[]> {
  const { data } = await api.get<Roteiro[]>('/historico', { params: filtros });
  return data;
}

export async function consultarMeuHistorico(filtros: Pick<FiltrosHistorico, 'dataInicial' | 'dataFinal'>): Promise<Roteiro[]> {
  const { data } = await api.get<Roteiro[]>('/historico/meu', { params: filtros });
  return data;
}

export async function exportarHistorico(filtros: FiltrosHistorico): Promise<void> {
  const { data } = await api.get<Blob>('/historico', {
    params: { ...filtros, formato: 'csv' },
    responseType: 'blob',
  });
  baixar(data, 'historico-de-roteiros.csv');
}
