import { Injectable } from '@nestjs/common';
import {
  ItemRoteiroStatus,
  RoteiroStatus,
} from '../../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LocalizacaoDto } from '../../roteiros/dto/localizacao.dto';
import { TipoDesafioLocalizacao } from '../../roteiros/dto/criar-desafio-localizacao.dto';

export interface CriarRoteiroInput {
  estabelecimentoId: string;
  unidadeId: string;
  entregadorId: string;
  data: Date;
  pontoIds: string[];
  receitaBruta?: number;
}

export interface FinalizarRoteiroInput {
  horaTermino: Date;
  tempoTotalParadoMin: number;
  distanciaTotalKm: number;
  custoEstimado: number;
}

const ROTEIRO_COM_ITENS = {
  itens: {
    orderBy: { ordem: 'asc' as const },
    include: { ponto: true },
  },
  entregador: true,
  unidade: { include: { parametro: true } },
};

export type RoteiroComItens = NonNullable<
  Awaited<ReturnType<RoteiroRepository['buscarComItens']>>
>;
export type ItemComRoteiro = NonNullable<
  Awaited<ReturnType<RoteiroRepository['buscarItemComRoteiro']>>
>;

/** RepositorioRoteiro (modelo-projeto.puml) — único ponto de acesso a `Roteiro`/`ItemRoteiro`. */
@Injectable()
export class RoteiroRepository {
  constructor(private readonly prisma: PrismaService) {}

  criarDesafioLocalizacao(input: {
    usuarioId: string;
    tipo: TipoDesafioLocalizacao;
    alvoId: string;
    expiraEm: Date;
  }) {
    return this.prisma.desafioLocalizacao.create({ data: input });
  }

  async consumirDesafioLocalizacao(input: {
    id: string;
    usuarioId: string;
    tipo: TipoDesafioLocalizacao;
    alvoId: string;
    agora: Date;
  }) {
    const resultado = await this.prisma.desafioLocalizacao.updateMany({
      where: {
        id: input.id,
        usuarioId: input.usuarioId,
        tipo: input.tipo,
        alvoId: input.alvoId,
        consumidoEm: null,
        expiraEm: { gte: input.agora },
      },
      data: { consumidoEm: input.agora },
    });
    return resultado.count === 1;
  }

  // entregadorId já escopa o Estabelecimento (um Entregador pertence a só um).
  findByEntregadorEData(entregadorId: string, data: Date) {
    return this.prisma.roteiro.findUnique({
      where: { entregadorId_data: { entregadorId, data } },
    });
  }

  // UC09: cria o Roteiro e seus ItemRoteiro (ordem = posição no array) numa transação.
  criar(input: CriarRoteiroInput) {
    return this.prisma.roteiro.create({
      data: {
        estabelecimentoId: input.estabelecimentoId,
        unidadeId: input.unidadeId,
        entregadorId: input.entregadorId,
        data: input.data,
        status: RoteiroStatus.NAO_INICIADO,
        receitaBruta: input.receitaBruta,
        itens: {
          create: input.pontoIds.map((pontoId, indice) => ({
            pontoId,
            ordem: indice + 1,
            status: ItemRoteiroStatus.PENDENTE,
          })),
        },
      },
      include: ROTEIRO_COM_ITENS,
    });
  }

  buscarComItens(estabelecimentoId: string, id: string) {
    return this.prisma.roteiro.findFirst({
      where: { id, estabelecimentoId },
      include: ROTEIRO_COM_ITENS,
    });
  }

  // UC10: roteiro do Entregador autenticado para a data corrente.
  buscarDoEntregadorNaData(
    estabelecimentoId: string,
    entregadorId: string,
    data: Date,
  ) {
    return this.prisma.roteiro.findFirst({
      where: { estabelecimentoId, entregadorId, data },
      include: ROTEIRO_COM_ITENS,
    });
  }

  // UC12/UC13: item + roteiro (com todos os itens, para checar ordem — RN06).
  buscarItemComRoteiro(estabelecimentoId: string, itemRoteiroId: string) {
    return this.prisma.itemRoteiro.findFirst({
      where: { id: itemRoteiroId, roteiro: { estabelecimentoId } },
      include: { ponto: true, roteiro: { include: ROTEIRO_COM_ITENS } },
    });
  }

  // UC11, passo 4: ponto de partida marcado visitado, sem tempo parado (RN01).
  concluirPontoDePartida(
    itemRoteiroId: string,
    agora: Date,
    localizacao: LocalizacaoDto,
  ) {
    return this.prisma.itemRoteiro.update({
      where: { id: itemRoteiroId },
      data: {
        horaChegada: agora,
        horaSaida: agora,
        status: ItemRoteiroStatus.CONCLUIDO,
        chegadaLatitude: localizacao.latitude,
        chegadaLongitude: localizacao.longitude,
        chegadaPrecisaoMetros: localizacao.precisaoMetros,
        chegadaCapturadaEm: new Date(localizacao.capturadaEm),
        saidaLatitude: localizacao.latitude,
        saidaLongitude: localizacao.longitude,
        saidaPrecisaoMetros: localizacao.precisaoMetros,
        saidaCapturadaEm: new Date(localizacao.capturadaEm),
      },
    });
  }

  iniciarRoteiro(roteiroId: string, horaInicio: Date) {
    return this.prisma.roteiro.update({
      where: { id: roteiroId },
      data: { horaInicio, status: RoteiroStatus.EM_ANDAMENTO },
    });
  }

  // UC12, passo 4/5.
  registrarChegadaItem(
    itemRoteiroId: string,
    horaChegada: Date,
    localizacao: LocalizacaoDto,
  ) {
    return this.prisma.itemRoteiro.update({
      where: { id: itemRoteiroId },
      data: {
        horaChegada,
        status: ItemRoteiroStatus.AGUARDANDO_SAIDA,
        chegadaLatitude: localizacao.latitude,
        chegadaLongitude: localizacao.longitude,
        chegadaPrecisaoMetros: localizacao.precisaoMetros,
        chegadaCapturadaEm: new Date(localizacao.capturadaEm),
      },
    });
  }

  // UC13, passos 3-5 (tempoParadoMin já vem calculado pelo UC15 — RN02).
  registrarSaidaItem(
    itemRoteiroId: string,
    horaSaida: Date,
    tempoParadoMin: number | null,
    localizacao: LocalizacaoDto,
  ) {
    return this.prisma.itemRoteiro.update({
      where: { id: itemRoteiroId },
      data: {
        horaSaida,
        tempoParadoMin,
        status: ItemRoteiroStatus.CONCLUIDO,
        saidaLatitude: localizacao.latitude,
        saidaLongitude: localizacao.longitude,
        saidaPrecisaoMetros: localizacao.precisaoMetros,
        saidaCapturadaEm: new Date(localizacao.capturadaEm),
      },
    });
  }

  // UC14, passo 5 (totais já vêm calculados pelo UC15/UC23).
  finalizar(roteiroId: string, dados: FinalizarRoteiroInput) {
    return this.prisma.roteiro.update({
      where: { id: roteiroId },
      data: { ...dados, status: RoteiroStatus.FINALIZADO },
    });
  }

  // UC16, passo 5-6: corrige horaChegada/horaSaida e o tempoParado recalculado (UC15).
  corrigirItem(
    itemRoteiroId: string,
    dados: {
      horaChegada?: Date;
      horaSaida?: Date;
      tempoParadoMin: number | null;
    },
  ) {
    return this.prisma.itemRoteiro.update({
      where: { id: itemRoteiroId },
      data: dados,
    });
  }

  // UC16, passo 7 (ADR-013): só o tempoTotalParado é recalculado; status/distância/custo não mudam.
  atualizarTempoTotalParado(roteiroId: string, tempoTotalParadoMin: number) {
    return this.prisma.roteiro.update({
      where: { id: roteiroId },
      data: { tempoTotalParadoMin },
    });
  }

  // UC18 (dashboard), UC19 (histórico), UC22 (meu histórico): roteiros finalizados no
  // período, com todos os dados já calculados por UC14/UC15/UC23 — nada é recalculado aqui.
  listarFinalizadosNoPeriodo(
    estabelecimentoId: string,
    filtros: {
      unidadeId?: string;
      entregadorId?: string;
      dataInicial: Date;
      dataFinal: Date;
    },
  ) {
    return this.prisma.roteiro.findMany({
      where: {
        estabelecimentoId,
        status: RoteiroStatus.FINALIZADO,
        data: { gte: filtros.dataInicial, lte: filtros.dataFinal },
        ...(filtros.unidadeId ? { unidadeId: filtros.unidadeId } : {}),
        ...(filtros.entregadorId ? { entregadorId: filtros.entregadorId } : {}),
      },
      include: ROTEIRO_COM_ITENS,
      orderBy: { data: 'desc' },
    });
  }
}
