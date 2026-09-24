import { Injectable } from '@nestjs/common';
import { AuditoriaRepository } from '../common/repositorios/auditoria.repository';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { ConsultarAuditoriaDto } from './dto/consultar-auditoria.dto';

const PERIODO_PADRAO_DIAS = 30;

/** UC17 — Consultar trilha de auditoria. */
@Injectable()
export class AuditoriaService {
  constructor(private readonly auditoria: AuditoriaRepository) {}

  consultar(tenant: TenantContextService, dto: ConsultarAuditoriaDto) {
    const dataFinal = dto.dataFinal ? new Date(dto.dataFinal) : new Date();
    const dataInicial = dto.dataInicial
      ? new Date(dto.dataInicial)
      : new Date(
          dataFinal.getTime() - PERIODO_PADRAO_DIAS * 24 * 60 * 60 * 1000,
        );

    // Isolamento por Unidade (constituição, item 2): Supervisor local nunca escolhe —
    // é sempre a própria; Supervisor geral pode filtrar por uma Unidade ou ver todas.
    const unidadeId = tenant.unidadeId ?? dto.unidadeId;

    return this.auditoria.listarCorrecoes({
      estabelecimentoId: tenant.estabelecimentoId,
      unidadeId,
      dataInicial,
      dataFinal,
    });
  }
}
