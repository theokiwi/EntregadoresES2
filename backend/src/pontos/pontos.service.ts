import { BadRequestException, Injectable } from '@nestjs/common';
import { Ponto } from '../../generated/prisma/client';
import { PontoRepository } from '../common/repositorios/ponto.repository';
import { UnidadeRepository } from '../common/repositorios/unidade.repository';
import { resolverUnidadeAlvo } from '../common/tenant/resolver-unidade-alvo';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CriarPontoDto } from './dto/criar-ponto.dto';

/** UC07 — Cadastrar ponto. */
@Injectable()
export class PontosService {
  constructor(
    private readonly pontos: PontoRepository,
    private readonly unidades: UnidadeRepository,
  ) {}

  async criar(
    tenant: TenantContextService,
    dto: CriarPontoDto,
  ): Promise<Ponto> {
    const unidadeId = await resolverUnidadeAlvo(
      tenant,
      this.unidades,
      dto.unidadeId,
    );
    return this.pontos.create({
      estabelecimentoId: tenant.estabelecimentoId,
      unidadeId,
      endereco: dto.endereco,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
  }

  listar(
    tenant: TenantContextService,
    unidadeIdConsultado?: string,
  ): Promise<Ponto[]> {
    const unidadeId = tenant.unidadeId ?? unidadeIdConsultado;
    if (!unidadeId) {
      throw new BadRequestException('Informe a Unidade para listar os pontos.');
    }
    return this.pontos.listByUnidade(tenant.estabelecimentoId, unidadeId);
  }
}
