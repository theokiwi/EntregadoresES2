import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { MontarRoteiroDto } from './dto/montar-roteiro.dto';
import { RoteirosService } from './roteiros.service';

@Controller('roteiros')
export class RoteirosController {
  constructor(
    private readonly roteirosService: RoteirosService,
    private readonly tenant: TenantContextService,
  ) {}

  @Post()
  @Perfis(Perfil.SUPERVISOR_LOCAL)
  montar(@Body() dto: MontarRoteiroDto) {
    return this.roteirosService.montar(this.tenant, dto);
  }

  @Get('hoje')
  @Perfis(Perfil.ENTREGADOR)
  consultarDoDia() {
    return this.roteirosService.consultarDoDia(this.tenant);
  }

  @Get(':id')
  @Perfis(Perfil.SUPERVISOR_LOCAL, Perfil.ENTREGADOR)
  consultarPorId(@Param('id') id: string) {
    return this.roteirosService.consultarPorId(this.tenant, id);
  }
}
