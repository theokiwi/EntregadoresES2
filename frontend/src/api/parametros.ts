import { api } from './client';
import type { Parametro } from './types';

export async function consultarParametros(unidadeId: string): Promise<Parametro> {
  const { data } = await api.get<Parametro>(`/unidades/${unidadeId}/parametros`);
  return data;
}

export async function atualizarCustos(
  unidadeId: string,
  input: { valorCombustivel: number; custoPorKm: number },
): Promise<Parametro> {
  const { data } = await api.put<Parametro>(`/unidades/${unidadeId}/parametros/custos`, input);
  return data;
}

export async function atualizarJornada(unidadeId: string, input: { jornadaPadraoHoras: number }): Promise<Parametro> {
  const { data } = await api.put<Parametro>(`/unidades/${unidadeId}/parametros/jornada`, input);
  return data;
}
