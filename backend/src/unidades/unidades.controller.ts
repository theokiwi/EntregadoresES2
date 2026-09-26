import { Body, Controller, Get, Post } from '@nestjs/common';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CriarUnidadeDto } from './dto/criar-unidade.dto';
import { UnidadesService } from './unidades.service';

@Controller('unidades')
@Perfis(Perfil.SUPERVISOR_GERAL)
export class UnidadesController {
  constructor(
    private readonly unidadesService: UnidadesService,
    private readonly tenant: TenantContextService,
  ) {}

  @Post()
  criar(@Body() dto: CriarUnidadeDto) {
    return this.unidadesService.criar(this.tenant.estabelecimentoId, dto);
  }

  @Get()
  listar() {
    return this.unidadesService.listar(this.tenant.estabelecimentoId);
  }
}
