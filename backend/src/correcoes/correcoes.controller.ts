import { Body, Controller, Param, Patch } from '@nestjs/common';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CorrecoesService } from './correcoes.service';
import { CorrigirHorarioDto } from './dto/corrigir-horario.dto';

@Controller('correcoes')
@Perfis(Perfil.SUPERVISOR_LOCAL)
export class CorrecoesController {
  constructor(
    private readonly correcoesService: CorrecoesService,
    private readonly tenant: TenantContextService,
  ) {}

  @Patch('itens/:itemId')
  corrigir(@Param('itemId') itemId: string, @Body() dto: CorrigirHorarioDto) {
    return this.correcoesService.corrigir(this.tenant, itemId, dto);
  }
}
