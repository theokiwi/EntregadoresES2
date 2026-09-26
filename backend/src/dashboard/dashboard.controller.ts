import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Perfil } from '../../generated/prisma/client';
import { Perfis } from '../common/auth/perfis.decorator';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { DashboardService } from './dashboard.service';
import { ConsultarDashboardDto } from './dto/consultar-dashboard.dto';

@Controller('dashboard')
@Perfis(Perfil.SUPERVISOR_LOCAL)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly tenant: TenantContextService,
  ) {}

  @Get('meu-ranking')
  @Perfis(Perfil.ENTREGADOR)
  meuRanking() {
    return this.dashboardService.consultarMeuRanking(this.tenant);
  }

  @Get()
  async consultar(@Query() dto: ConsultarDashboardDto, @Res({ passthrough: true }) res: Response) {
    if (dto.formato === 'csv') {
      const csv = await this.dashboardService.exportarCsv(this.tenant, dto);
      if (csv === null) {
        return { message: 'Não há dados para exportar no período selecionado.' };
      }
      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.header('Content-Disposition', 'attachment; filename="dashboard.csv"');
      return csv;
    }
    return this.dashboardService.consultar(this.tenant, dto);
  }
}
