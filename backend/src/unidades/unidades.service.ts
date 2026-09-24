import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, Unidade } from '../../generated/prisma/client';
import { UnidadeRepository } from '../common/repositorios/unidade.repository';
import { CriarUnidadeDto } from './dto/criar-unidade.dto';

/** UC01 — Cadastrar unidade. */
@Injectable()
export class UnidadesService {
  constructor(private readonly unidades: UnidadeRepository) {}

  async criar(
    estabelecimentoId: string,
    dto: CriarUnidadeDto,
  ): Promise<Unidade> {
    try {
      return await this.unidades.create({ estabelecimentoId, ...dto });
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2002'
      ) {
        throw new ConflictException(
          `Já existe uma unidade chamada "${dto.nome}" neste Estabelecimento.`,
        );
      }
      throw erro;
    }
  }

  listar(estabelecimentoId: string): Promise<Unidade[]> {
    return this.unidades.listByEstabelecimento(estabelecimentoId);
  }
}
