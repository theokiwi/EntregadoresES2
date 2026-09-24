import { Controller, Get, Param, Post, Body } from '@nestjs/common';
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

  @Post(':id/iniciar')
  @Perfis(Perfil.ENTREGADOR)
  iniciar(@Param('id') id: string) {
    return this.roteirosService.iniciar(this.tenant, id);
  }

  @Post(':id/finalizar')
  @Perfis(Perfil.ENTREGADOR)
  finalizar(@Param('id') id: string) {
    return this.roteirosService.finalizar(this.tenant, id);
  }

  @Post('itens/:itemId/chegada')
  @Perfis(Perfil.ENTREGADOR)
  registrarChegada(@Param('itemId') itemId: string) {
    return this.roteirosService.registrarChegada(this.tenant, itemId);
  }

  @Post('itens/:itemId/saida')
  @Perfis(Perfil.ENTREGADOR)
  registrarSaida(@Param('itemId') itemId: string) {
    return this.roteirosService.registrarSaida(this.tenant, itemId);
  }

  @Get(':id')
  @Perfis(Perfil.SUPERVISOR_LOCAL, Perfil.ENTREGADOR)
  consultarPorId(@Param('id') id: string) {
    return this.roteirosService.consultarPorId(this.tenant, id);
  }
}
