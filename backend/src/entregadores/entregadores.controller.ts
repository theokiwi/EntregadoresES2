import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { paraUsuarioPublico } from '../common/usuario-publico.mapper';
import { CriarEntregadorDto } from './dto/criar-entregador.dto';
import { EntregadoresService } from './entregadores.service';

@Controller('entregadores')
@Perfis(Perfil.SUPERVISOR_LOCAL)
export class EntregadoresController {
  constructor(
    private readonly entregadoresService: EntregadoresService,
    private readonly tenant: TenantContextService,
  ) {}

  @Post()
  async criar(@Body() dto: CriarEntregadorDto) {
    const entregador = await this.entregadoresService.criar(this.tenant, dto);
    return paraUsuarioPublico(entregador);
  }

  @Get()
  async listar(@Query('unidadeId') unidadeId?: string) {
    const entregadores = await this.entregadoresService.listar(
      this.tenant,
      unidadeId,
    );
    return entregadores.map(paraUsuarioPublico);
  }
}
