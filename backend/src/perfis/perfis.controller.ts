import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { paraUsuarioPublico } from '../common/usuario-publico.mapper';
import { AtribuirPerfilDto } from './dto/atribuir-perfil.dto';
import { PerfisService } from './perfis.service';

@Controller('usuarios')
@Perfis(Perfil.SUPERVISOR_GERAL)
export class PerfisController {
  constructor(
    private readonly perfisService: PerfisService,
    private readonly tenant: TenantContextService,
  ) {}

  @Get()
  async buscar(@Query('busca') busca = '') {
    const usuarios = await this.perfisService.buscar(
      this.tenant.estabelecimentoId,
      busca,
    );
    return usuarios.map(paraUsuarioPublico);
  }

  @Patch(':id/perfil')
  async atribuir(@Param('id') id: string, @Body() dto: AtribuirPerfilDto) {
    const atualizado = await this.perfisService.atribuir(
      this.tenant.estabelecimentoId,
      this.tenant.usuarioId,
      id,
      dto,
    );
    return paraUsuarioPublico(atualizado);
  }
}
