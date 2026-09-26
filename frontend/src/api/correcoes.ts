import { api } from './client';
import type { Roteiro } from './types';

export interface CorrigirHorarioInput {
  campo: 'horaChegada' | 'horaSaida';
  novoValor: string;
  justificativa: string;
}

export async function corrigirHorario(itemRoteiroId: string, input: CorrigirHorarioInput): Promise<Roteiro> {
  const { data } = await api.patch<Roteiro>(`/correcoes/itens/${itemRoteiroId}`, input);
  return data;
}
