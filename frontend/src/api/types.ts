export type Perfil = 'ENTREGADOR' | 'SUPERVISOR_LOCAL' | 'SUPERVISOR_GERAL';

export interface Sessao {
  accessToken: string;
  usuarioId: string;
  nome: string;
  perfil: Perfil;
  estabelecimentoId: string;
  unidadeId: string | null;
}

export interface Unidade {
  id: string;
  estabelecimentoId: string;
  nome: string;
  endereco: string;
  fusoHorario: string;
  createdAt: string;
}

export interface Parametro {
  id?: string;
  unidadeId?: string;
  valorCombustivel?: string;
  custoPorKm?: string;
  jornadaPadraoHoras: number;
}

export interface UsuarioPublico {
  id: string;
  estabelecimentoId: string;
  unidadeId: string | null;
  email: string;
  perfil: Perfil;
  ativo: boolean;
  nome: string;
  telefone: string | null;
  senhaDefinida: boolean;
  createdAt: string;
}
