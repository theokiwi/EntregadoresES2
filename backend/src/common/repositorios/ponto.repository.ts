import { Injectable } from '@nestjs/common';
import { Ponto } from '../../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CriarPontoInput {
  estabelecimentoId: string;
  unidadeId: string;
  endereco: string;
  latitude: number;
  longitude: number;
}

/** RepositorioPonto (modelo-projeto.puml) — único ponto de acesso a `Ponto`. */
@Injectable()
export class PontoRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CriarPontoInput): Promise<Ponto> {
    return this.prisma.ponto.create({ data: input });
  }

  findById(estabelecimentoId: string, id: string): Promise<Ponto | null> {
    return this.prisma.ponto.findFirst({ where: { id, estabelecimentoId } });
  }

  listByUnidade(
    estabelecimentoId: string,
    unidadeId: string,
  ): Promise<Ponto[]> {
    return this.prisma.ponto.findMany({
      where: { estabelecimentoId, unidadeId },
      orderBy: { endereco: 'asc' },
    });
  }
}
