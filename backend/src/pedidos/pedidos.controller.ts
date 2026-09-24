import { Body, Controller, Post } from '@nestjs/common';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { RegistrarPedidoDto } from './dto/registrar-pedido.dto';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
@Perfis(Perfil.SUPERVISOR_LOCAL)
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
    private readonly tenant: TenantContextService,
  ) {}

  @Post()
  registrar(@Body() dto: RegistrarPedidoDto) {
    return this.pedidosService.registrar(this.tenant, dto);
  }
}
