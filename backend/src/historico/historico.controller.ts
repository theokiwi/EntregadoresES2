import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { ConsultarHistoricoDto } from './dto/consultar-historico.dto';
import { ConsultarMeuHistoricoDto } from './dto/consultar-meu-historico.dto';
import { HistoricoService } from './historico.service';

@Controller('historico')
export class HistoricoController {
  constructor(
    private readonly historicoService: HistoricoService,
    private readonly tenant: TenantContextService,
  ) {}

  @Get()
  @Perfis(Perfil.SUPERVISOR_LOCAL)
  async consultar(@Query() dto: ConsultarHistoricoDto, @Res({ passthrough: true }) res: Response) {
    if (dto.formato === 'csv') {
      const csv = await this.historicoService.exportarCsv(this.tenant, dto);
      if (csv === null) {
        return { message: 'Não há dados para exportar no período selecionado.' };
      }
      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.header('Content-Disposition', 'attachment; filename="historico.csv"');
      return csv;
    }
    return this.historicoService.consultar(this.tenant, dto);
  }

  @Get('meu')
  @Perfis(Perfil.ENTREGADOR)
  consultarProprio(@Query() dto: ConsultarMeuHistoricoDto) {
    return this.historicoService.consultarProprio(this.tenant, dto);
  }
}
