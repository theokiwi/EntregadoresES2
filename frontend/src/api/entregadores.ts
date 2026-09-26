import { api } from './client';
import type { UsuarioPublico } from './types';

export interface CriarEntregadorInput {
  nome: string;
  telefone: string;
  documento: string;
  veiculo: string;
  tipoCombustivel: 'GASOLINA' | 'DIESEL';
  rendimentoKmLitro: number;
  email?: string;
  unidadeId?: string;
}

export async function criarEntregador(input: CriarEntregadorInput): Promise<UsuarioPublico> {
  const { data } = await api.post<UsuarioPublico>('/entregadores', input);
  return data;
}

export async function listarEntregadores(unidadeId?: string): Promise<UsuarioPublico[]> {
  const { data } = await api.get<UsuarioPublico[]>('/entregadores', { params: { unidadeId } });
  return data;
}
