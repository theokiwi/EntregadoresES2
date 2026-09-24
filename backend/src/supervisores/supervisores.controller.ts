import { Body, Controller, Post } from '@nestjs/common';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { paraUsuarioPublico } from '../common/usuario-publico.mapper';
import { CriarSupervisorDto } from './dto/criar-supervisor.dto';
import { SupervisoresService } from './supervisores.service';

@Controller('supervisores')
@Perfis(Perfil.SUPERVISOR_GERAL)
export class SupervisoresController {
  constructor(
    private readonly supervisoresService: SupervisoresService,
    private readonly tenant: TenantContextService,
  ) {}

  @Post()
  async criar(@Body() dto: CriarSupervisorDto) {
    const supervisor = await this.supervisoresService.criar(
      this.tenant.estabelecimentoId,
      dto,
    );
    return paraUsuarioPublico(supervisor);
  }
}
