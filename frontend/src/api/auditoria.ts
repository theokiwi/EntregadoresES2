import { api } from './client';
import type { Auditoria } from './types';

export interface ConsultarAuditoriaFiltros {
  dataInicial?: string;
  dataFinal?: string;
  unidadeId?: string;
}

export async function consultarAuditoria(filtros: ConsultarAuditoriaFiltros): Promise<Auditoria[]> {
  const { data } = await api.get<Auditoria[]>('/auditoria', { params: filtros });
  return data;
}
