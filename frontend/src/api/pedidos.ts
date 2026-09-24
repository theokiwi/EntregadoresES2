import { api } from './client';
import type { Ponto } from './types';

export interface RegistrarPedidoInput {
  endereco: string;
  latitude?: number;
  longitude?: number;
  unidadeId?: string;
}

export interface RegistrarPedidoResultado {
  ponto: Ponto;
  reaproveitado: boolean;
}

export async function registrarPedido(input: RegistrarPedidoInput): Promise<RegistrarPedidoResultado> {
  const { data } = await api.post<RegistrarPedidoResultado>('/pedidos', input);
  return data;
}
