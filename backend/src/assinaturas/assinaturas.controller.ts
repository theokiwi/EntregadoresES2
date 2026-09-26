import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { Public } from '../common/auth/public.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { AssinaturasService } from './assinaturas.service';
import { AlterarPlanoDto } from './dto/alterar-plano.dto';
import { ContratarAssinaturaDto } from './dto/contratar-assinatura.dto';

@Controller('assinaturas')
export class AssinaturasController {
  constructor(
    private readonly service: AssinaturasService,
    private readonly tenant: TenantContextService,
  ) {}

  @Public()
  @Get('planos')
  planos() {
    return this.service.listarPlanos();
  }

  @Public()
  @Post('contratar')
  contratar(@Body() dto: ContratarAssinaturaDto) {
    return this.service.contratar(dto);
  }

  @Perfis(Perfil.SUPERVISOR_GERAL)
  @Get('minha')
  consultar() {
    return this.service.consultar(this.tenant.estabelecimentoId);
  }

  @Perfis(Perfil.SUPERVISOR_GERAL)
  @Patch('minha/plano')
  alterar(@Body() dto: AlterarPlanoDto) {
    return this.service.alterarPlano(this.tenant.estabelecimentoId, dto);
  }
}
