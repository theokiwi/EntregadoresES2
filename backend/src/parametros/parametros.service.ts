import { Injectable, NotFoundException } from '@nestjs/common';
import { Parametro } from '../../generated/prisma/client';
import { ParametroRepository } from '../common/repositorios/parametro.repository';
import { UnidadeRepository } from '../common/repositorios/unidade.repository';
import { AtualizarCustosDto } from './dto/atualizar-custos.dto';
import { AtualizarJornadaDto } from './dto/atualizar-jornada.dto';

const JORNADA_PADRAO_HORAS = 8;

/** UC03 (custos) + UC04 (jornada/regras) — mesma entidade Parametro, recortes de campos. */
@Injectable()
export class ParametrosService {
  constructor(
    private readonly parametros: ParametroRepository,
    private readonly unidades: UnidadeRepository,
  ) {}

  private async garantirUnidade(
    estabelecimentoId: string,
    unidadeId: string,
  ): Promise<void> {
    const unidade = await this.unidades.findById(estabelecimentoId, unidadeId);
    if (!unidade) {
      throw new NotFoundException(
        'Unidade não encontrada neste Estabelecimento.',
      );
    }
  }

  async consultar(
    estabelecimentoId: string,
    unidadeId: string,
  ): Promise<Parametro | { jornadaPadraoHoras: number }> {
    await this.garantirUnidade(estabelecimentoId, unidadeId);
    const existente = await this.parametros.findByUnidade(unidadeId);
    // UC04, critério de aceitação: Unidade sem parametrização prévia retorna a jornada default.
    return existente ?? { jornadaPadraoHoras: JORNADA_PADRAO_HORAS };
  }

  async atualizarCustos(
    estabelecimentoId: string,
    unidadeId: string,
    dto: AtualizarCustosDto,
  ): Promise<Parametro> {
    await this.garantirUnidade(estabelecimentoId, unidadeId);
    return this.parametros.upsert({ unidadeId, ...dto });
  }

  async atualizarJornada(
    estabelecimentoId: string,
    unidadeId: string,
    dto: AtualizarJornadaDto,
  ): Promise<Parametro> {
    await this.garantirUnidade(estabelecimentoId, unidadeId);
    return this.parametros.upsert({ unidadeId, ...dto });
  }
}
