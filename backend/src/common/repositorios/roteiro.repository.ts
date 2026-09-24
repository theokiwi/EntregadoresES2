import { Injectable } from '@nestjs/common';
import {
  ItemRoteiroStatus,
  Roteiro,
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

  atualizarStatus(id: string, status: Roteiro['status']) {
    return this.prisma.roteiro.update({ where: { id }, data: { status } });
  }
}
