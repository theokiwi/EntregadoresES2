import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CriarPontoDto } from './dto/criar-ponto.dto';
import { PontosService } from './pontos.service';

@Controller('pontos')
@Perfis(Perfil.SUPERVISOR_LOCAL)
export class PontosController {
  constructor(
    private readonly pontosService: PontosService,
    private readonly tenant: TenantContextService,
  ) {}

  @Post()
  criar(@Body() dto: CriarPontoDto) {
    return this.pontosService.criar(this.tenant, dto);
  }

  @Get()
  listar(@Query('unidadeId') unidadeId?: string) {
    return this.pontosService.listar(this.tenant, unidadeId);
  }
}
