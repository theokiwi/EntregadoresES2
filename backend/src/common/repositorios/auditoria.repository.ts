import { Injectable } from '@nestjs/common';
import { Auditoria } from '../../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface RegistrarAuditoriaInput {
  estabelecimentoId: string;
  autorId: string;
  itemRoteiroId?: string | null;
  entidade: string;
  campo: string;
  valorAnterior: string;
  valorNovo: string;
  justificativa?: string | null;
}

export interface ListarCorrecoesInput {
  estabelecimentoId: string;
  unidadeId?: string;
  dataInicial: Date;
  dataFinal: Date;
}

/** RepositorioAuditoria (modelo-projeto.puml). Registro imutável (RNF05) — só create/read. */
@Injectable()
export class AuditoriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  registrar(input: RegistrarAuditoriaInput): Promise<Auditoria> {
    return this.prisma.auditoria.create({ data: input });
  }

  // UC17: só correções de horário (itemRoteiroId preenchido — UC16), nunca as trocas de
  // perfil/Unidade da UC05, que são outra trilha (escopo de Estabelecimento, não Unidade).
  listarCorrecoes(input: ListarCorrecoesInput) {
    return this.prisma.auditoria.findMany({
      where: {
        estabelecimentoId: input.estabelecimentoId,
        itemRoteiroId: { not: null },
        dataHoraCorrecao: { gte: input.dataInicial, lte: input.dataFinal },
        ...(input.unidadeId
          ? { itemRoteiro: { roteiro: { unidadeId: input.unidadeId } } }
          : {}),
      },
      include: {
        autor: { select: { id: true, nome: true } },
        itemRoteiro: {
          include: {
            ponto: true,
            roteiro: {
              select: {
                id: true,
                data: true,
                unidadeId: true,
                entregadorId: true,
              },
            },
          },
        },
      },
      orderBy: { dataHoraCorrecao: 'desc' },
    });
  }
}
