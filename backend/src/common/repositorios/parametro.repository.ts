import { Injectable } from '@nestjs/common';
import { Parametro } from '../../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface UpsertParametroInput {
  unidadeId: string;
  valorCombustivel?: number;
  custoPorKm?: number;
  jornadaPadraoHoras?: number;
}

const PARAMETRO_PADRAO = {
  valorCombustivel: 0,
  custoPorKm: 0,
  jornadaPadraoHoras: 8,
};

/** RepositorioParametro (modelo-projeto.puml) — único ponto de acesso a `Parametro`. */
@Injectable()
export class ParametroRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUnidade(unidadeId: string): Promise<Parametro | null> {
    return this.prisma.parametro.findUnique({ where: { unidadeId } });
  }

  // UC03/UC04 editam o mesmo registro em recortes de campos diferentes (custos vs. jornada).
  async upsert(input: UpsertParametroInput): Promise<Parametro> {
    const existente = await this.findByUnidade(input.unidadeId);
    const dados = {
      valorCombustivel:
        input.valorCombustivel ??
        existente?.valorCombustivel ??
        PARAMETRO_PADRAO.valorCombustivel,
      custoPorKm:
        input.custoPorKm ??
        existente?.custoPorKm ??
        PARAMETRO_PADRAO.custoPorKm,
      jornadaPadraoHoras:
        input.jornadaPadraoHoras ??
        existente?.jornadaPadraoHoras ??
        PARAMETRO_PADRAO.jornadaPadraoHoras,
    };
    return this.prisma.parametro.upsert({
      where: { unidadeId: input.unidadeId },
      create: { unidadeId: input.unidadeId, ...dados },
      update: dados,
    });
  }
}
