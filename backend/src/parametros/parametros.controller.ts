import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { AtualizarCustosDto } from './dto/atualizar-custos.dto';
import { AtualizarJornadaDto } from './dto/atualizar-jornada.dto';
import { ParametrosService } from './parametros.service';

@Controller('unidades/:unidadeId/parametros')
@Perfis(Perfil.SUPERVISOR_GERAL)
export class ParametrosController {
  constructor(
    private readonly parametrosService: ParametrosService,
    private readonly tenant: TenantContextService,
  ) {}

  @Get()
  consultar(@Param('unidadeId') unidadeId: string) {
    return this.parametrosService.consultar(
      this.tenant.estabelecimentoId,
      unidadeId,
    );
  }

  @Put('custos')
  atualizarCustos(
    @Param('unidadeId') unidadeId: string,
    @Body() dto: AtualizarCustosDto,
  ) {
    return this.parametrosService.atualizarCustos(
      this.tenant.estabelecimentoId,
      unidadeId,
      dto,
    );
  }

  @Put('jornada')
  atualizarJornada(
    @Param('unidadeId') unidadeId: string,
    @Body() dto: AtualizarJornadaDto,
  ) {
    return this.parametrosService.atualizarJornada(
      this.tenant.estabelecimentoId,
      unidadeId,
      dto,
    );
  }
}
