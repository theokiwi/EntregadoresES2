export type Perfil = 'ENTREGADOR' | 'SUPERVISOR_LOCAL' | 'SUPERVISOR_GERAL';

export interface Sessao {
  accessToken: string;
  usuarioId: string;
  nome: string;
  perfil: Perfil;
  estabelecimentoId: string;
  unidadeId: string | null;
}
