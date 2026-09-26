import { api } from './client';

export type PlanoCodigo = 'ESSENCIAL' | 'PROFISSIONAL' | 'ESCALA';
export interface Plano { codigo: PlanoCodigo; nome: string; valorMensal: number; limiteEntregadores: number; limiteUnidades: number; destaque: boolean }
export interface Assinatura { id: string; plano: PlanoCodigo; status: 'ATIVA' | 'CANCELADA'; valorMensal: number; proximaCobranca: string; pagamentoMock: boolean; cartaoFinal: string | null }
export interface Contratacao { plano: PlanoCodigo; empresaNome: string; unidadeNome: string; endereco: string; administradorNome: string; email: string; senha: string; numeroCartao: string; cvv: string; validade: string }

export async function listarPlanos(): Promise<Plano[]> { return (await api.get('/assinaturas/planos')).data; }
export async function contratar(dados: Contratacao): Promise<void> { await api.post('/assinaturas/contratar', dados); }
export async function consultar(): Promise<Assinatura> { return (await api.get('/assinaturas/minha')).data; }
export async function alterarPlano(plano: PlanoCodigo): Promise<Assinatura> { return (await api.patch('/assinaturas/minha/plano', { plano })).data; }
