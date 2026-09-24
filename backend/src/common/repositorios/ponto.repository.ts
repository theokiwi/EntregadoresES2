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

  // UC08, passo 3: reaproveita um Ponto existente com o mesmo endereço na Unidade.
  findByEnderecoNaUnidade(
    estabelecimentoId: string,
    unidadeId: string,
    endereco: string,
  ): Promise<Ponto | null> {
    return this.prisma.ponto.findFirst({
      where: {
        estabelecimentoId,
        unidadeId,
        endereco: { equals: endereco.trim(), mode: 'insensitive' },
      },
    });
  }

  // UC09: valida que todos os pontos selecionados pertencem à mesma Unidade.
  listByIds(
    estabelecimentoId: string,
    unidadeId: string,
    ids: string[],
  ): Promise<Ponto[]> {
    return this.prisma.ponto.findMany({
      where: { estabelecimentoId, unidadeId, id: { in: ids } },
    });
  }
}
