import { api } from './client';
import type { DashboardResumo, MeuRanking } from './types';

export interface FiltrosDashboard {
  dataInicial?: string;
  dataFinal?: string;
  unidadeId?: string;
}

export async function consultarDashboard(filtros: FiltrosDashboard): Promise<DashboardResumo> {
  const { data } = await api.get<DashboardResumo>('/dashboard', { params: filtros });
  return data;
}

export async function consultarMeuRanking(): Promise<MeuRanking> {
  const { data } = await api.get<MeuRanking>('/dashboard/meu-ranking');
  return data;
}

export async function exportarDashboard(filtros: FiltrosDashboard): Promise<void> {
  const { data } = await api.get<Blob>('/dashboard', {
    params: { ...filtros, formato: 'csv' },
    responseType: 'blob',
  });
  baixar(data, 'dashboard-tempo-parado.csv');
}

export function baixar(conteudo: Blob, nome: string) {
  const url = URL.createObjectURL(conteudo);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(url);
}
