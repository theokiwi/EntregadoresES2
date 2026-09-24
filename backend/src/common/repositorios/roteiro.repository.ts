import { Injectable } from '@nestjs/common';
import {
  ItemRoteiroStatus,
  RoteiroStatus,
} from '../../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CriarRoteiroInput {
  estabelecimentoId: string;
  unidadeId: string;
  entregadorId: string;
  data: Date;
  pontoIds: string[];
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
  concluirPontoDePartida(itemRoteiroId: string, agora: Date) {
    return this.prisma.itemRoteiro.update({
      where: { id: itemRoteiroId },
      data: {
        horaChegada: agora,
        horaSaida: agora,
        status: ItemRoteiroStatus.CONCLUIDO,
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
  registrarChegadaItem(itemRoteiroId: string, horaChegada: Date) {
    return this.prisma.itemRoteiro.update({
      where: { id: itemRoteiroId },
      data: { horaChegada, status: ItemRoteiroStatus.AGUARDANDO_SAIDA },
    });
  }

  // UC13, passos 3-5 (tempoParadoMin já vem calculado pelo UC15 — RN02).
  registrarSaidaItem(
    itemRoteiroId: string,
    horaSaida: Date,
    tempoParadoMin: number | null,
  ) {
    return this.prisma.itemRoteiro.update({
      where: { id: itemRoteiroId },
      data: { horaSaida, tempoParadoMin, status: ItemRoteiroStatus.CONCLUIDO },
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
}
