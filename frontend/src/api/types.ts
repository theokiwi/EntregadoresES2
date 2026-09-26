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
  tipoCombustivel: 'GASOLINA' | 'DIESEL' | null;
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
  receitaBruta: string | null;
  itens: ItemRoteiro[];
  entregador?: UsuarioPublico;
}

export interface Auditoria {
  id: string;
  autorId: string;
  autor: { id: string; nome: string };
  itemRoteiroId: string | null;
  dataHoraCorrecao: string;
  entidade: string;
  campo: string;
  valorAnterior: string;
  valorNovo: string;
  justificativa: string | null;
  itemRoteiro: {
    ordem: number;
    ponto: Ponto;
    roteiro: { id: string; data: string; unidadeId: string; entregadorId: string };
  } | null;
}

export interface DashboardResumo {
  roteiros: Array<{
    id: string;
    data: string;
    entregadorNome: string;
    unidadeId: string;
    unidadeNome: string;
    tempoTotalParadoMin: number | null;
    distanciaKm: number;
    litrosConsumidos: number;
    custoCombustivel: number;
  }>;
  total: number;
  media: number;
  resumo: IndicadoresOperacionais;
  porEntregador: Array<IndicadoresOperacionais & { entregadorId: string; entregadorNome: string; unidadeId: string; unidadeNome: string; veiculo: string | null; tipoCombustivel: 'GASOLINA' | 'DIESEL' | null; rendimentoKmLitro: number; series: SeriesDesempenho }>;
  porUnidade: Array<IndicadoresOperacionais & { unidadeId: string; unidadeNome: string; entregadores: DashboardResumo['porEntregador']; series: SeriesDesempenho }>;
  series: Record<'diaria' | 'semanal' | 'mensal' | 'anual', Array<IndicadoresOperacionais & { periodo: string }>>;
  financeiro: { custoCombustivel: number; receitaBruta: number | null; lucro: number | null; motivoIndisponibilidade: string | null };
}

export type SeriesDesempenho = Record<'diaria' | 'semanal' | 'mensal' | 'anual', Array<IndicadoresOperacionais & { periodo: string }>>;

export interface IndicadoresOperacionais {
  rotasConcluidas: number;
  distanciaKm: number;
  tempoParadoMin: number;
  litrosConsumidos: number;
  custoCombustivel: number;
  receitaBruta: number | null;
  lucro: number | null;
  duracaoMediaMin: number | null;
}

export interface MeuRanking {
  periodo: { dataInicial: string; dataFinal: string };
  totalParticipantes: number;
  minhaPosicao: number | null;
  minhaPontuacao: number;
  pontosParaSubir: number;
  meuDesempenho: { rotasConcluidas: number; distanciaKm: number; tempoMedioParadoMin: number };
  ranking: Array<{ entregadorId: string; nome: string; pontuacao: number; posicao: number; souEu: boolean }>;
  conquistas: Array<{ codigo: string; titulo: string; descricao: string }>;
  criterio: string;
}
