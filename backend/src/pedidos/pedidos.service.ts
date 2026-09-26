import { BadRequestException, Injectable } from '@nestjs/common';
import { Ponto } from '../../generated/prisma/client';
import { PontoRepository } from '../common/repositorios/ponto.repository';
import { UnidadeRepository } from '../common/repositorios/unidade.repository';
import { resolverUnidadeAlvo } from '../common/tenant/resolver-unidade-alvo';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { RegistrarPedidoDto } from './dto/registrar-pedido.dto';

export interface RegistrarPedidoResultado {
  ponto: Ponto;
  reaproveitado: boolean;
}

/** UC08 — Registrar pedidos/endereços de entrega (inclui UC07 condicionalmente — ADR-010). */
@Injectable()
export class PedidosService {
  constructor(
    private readonly pontos: PontoRepository,
    private readonly unidades: UnidadeRepository,
  ) {}

  async registrar(
    tenant: TenantContextService,
    dto: RegistrarPedidoDto,
  ): Promise<RegistrarPedidoResultado> {
    const unidadeId = await resolverUnidadeAlvo(
      tenant,
      this.unidades,
      dto.unidadeId,
    );

    const existente = await this.pontos.findByEnderecoNaUnidade(
      tenant.estabelecimentoId,
      unidadeId,
      dto.endereco,
    );
    if (existente) {
      return { ponto: existente, reaproveitado: true };
    }

    // 3a («include» UC07): endereço não encontrado — cria um novo Ponto, coordenadas obrigatórias (ADR-009).
    if (dto.latitude === undefined || dto.longitude === undefined) {
      throw new BadRequestException(
        'Endereço não encontrado na base — informe latitude e longitude para cadastrar um novo Ponto.',
      );
    }

    const novoPonto = await this.pontos.create({
      estabelecimentoId: tenant.estabelecimentoId,
      unidadeId,
      endereco: dto.endereco,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
    return { ponto: novoPonto, reaproveitado: false };
  }
}
