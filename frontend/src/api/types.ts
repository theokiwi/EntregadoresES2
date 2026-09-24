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
  documento: string | null;
  veiculo: string | null;
  rendimentoKmLitro: string | null;
  senhaDefinida: boolean;
  createdAt: string;
}

export interface Ponto {
  id: string;
  estabelecimentoId: string;
  unidadeId: string;
  endereco: string;
  latitude: string;
  longitude: string;
  createdAt: string;
}

export type ItemRoteiroStatus = 'PENDENTE' | 'AGUARDANDO_SAIDA' | 'CONCLUIDO';
export type RoteiroStatus = 'NAO_INICIADO' | 'EM_ANDAMENTO' | 'FINALIZADO';

export interface ItemRoteiro {
  id: string;
  roteiroId: string;
  pontoId: string;
  ordem: number;
  horaChegada: string | null;
  horaSaida: string | null;
  tempoParadoMin: number | null;
  status: ItemRoteiroStatus;
  ponto: Ponto;
}

export interface Roteiro {
  id: string;
  estabelecimentoId: string;
  unidadeId: string;
  entregadorId: string;
  data: string;
  status: RoteiroStatus;
  horaInicio: string | null;
  horaTermino: string | null;
  tempoTotalParadoMin: number | null;
  distanciaTotalKm: string | null;
  custoEstimado: string | null;
  itens: ItemRoteiro[];
  entregador?: UsuarioPublico;
}
