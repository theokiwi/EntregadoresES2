import { Controller, Get, Query } from '@nestjs/common';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { AuditoriaService } from './auditoria.service';
import { ConsultarAuditoriaDto } from './dto/consultar-auditoria.dto';

@Controller('auditoria')
@Perfis(Perfil.SUPERVISOR_LOCAL)
export class AuditoriaController {
  constructor(
    private readonly auditoriaService: AuditoriaService,
    private readonly tenant: TenantContextService,
  ) {}

  @Get()
  consultar(@Query() dto: ConsultarAuditoriaDto) {
    return this.auditoriaService.consultar(this.tenant, dto);
  }
}
