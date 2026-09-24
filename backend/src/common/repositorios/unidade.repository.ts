import { Injectable } from '@nestjs/common';
import { Unidade } from '../../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CriarUnidadeInput {
  estabelecimentoId: string;
  nome: string;
  endereco: string;
  fusoHorario: string;
}

/** RepositorioUnidade (modelo-projeto.puml) — único ponto de acesso a `Unidade`. */
@Injectable()
export class UnidadeRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CriarUnidadeInput): Promise<Unidade> {
    return this.prisma.unidade.create({ data: input });
  }

  findById(estabelecimentoId: string, id: string): Promise<Unidade | null> {
    return this.prisma.unidade.findFirst({ where: { id, estabelecimentoId } });
  }

  listByEstabelecimento(estabelecimentoId: string): Promise<Unidade[]> {
    return this.prisma.unidade.findMany({
      where: { estabelecimentoId },
      orderBy: { nome: 'asc' },
    });
  }
}
