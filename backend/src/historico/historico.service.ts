import { BadRequestException, Injectable } from '@nestjs/common';
import { gerarCsv } from '../common/csv';
import { paraDataSemHora } from '../common/data';
import { RoteiroComItens, RoteiroRepository } from '../common/repositorios/roteiro.repository';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { ConsultarHistoricoDto } from './dto/consultar-historico.dto';
import { ConsultarMeuHistoricoDto } from './dto/consultar-meu-historico.dto';

/** UC19 — Consultar histórico de pontos e tempos; UC22 — Consultar o próprio histórico; UC21 extend (CSV). */
@Injectable()
export class HistoricoService {
  constructor(private readonly roteiros: RoteiroRepository) {}

  private validarPeriodo(dataInicial: Date, dataFinal: Date): void {
    // 2a: data final anterior à inicial.
    if (dataFinal < dataInicial) {
      throw new BadRequestException('A data final deve ser igual ou posterior à data inicial.');
    }
  }

  // UC19 — Supervisor local (a própria Unidade) ou geral (a Unidade informada, ou todas).
  consultar(tenant: TenantContextService, dto: ConsultarHistoricoDto): Promise<RoteiroComItens[]> {
    const dataInicial = paraDataSemHora(dto.dataInicial);
    const dataFinal = paraDataSemHora(dto.dataFinal);
    this.validarPeriodo(dataInicial, dataFinal);

    const unidadeId = tenant.unidadeId ?? dto.unidadeId;
    return this.roteiros.listarFinalizadosNoPeriodo(tenant.estabelecimentoId, {
      unidadeId,
      entregadorId: dto.entregadorId,
      dataInicial,
      dataFinal,
    });
  }

  // UC22 — RNF06/3b: entregadorId é sempre o do próprio autenticado, nunca informado pelo cliente.
  consultarProprio(tenant: TenantContextService, dto: ConsultarMeuHistoricoDto): Promise<RoteiroComItens[]> {
    const dataInicial = paraDataSemHora(dto.dataInicial);
    const dataFinal = paraDataSemHora(dto.dataFinal);
    this.validarPeriodo(dataInicial, dataFinal);

    return this.roteiros.listarFinalizadosNoPeriodo(tenant.estabelecimentoId, {
      entregadorId: tenant.usuarioId,
      dataInicial,
      dataFinal,
    });
  }

  async exportarCsv(tenant: TenantContextService, dto: ConsultarHistoricoDto): Promise<string | null> {
    const roteiros = await this.consultar(tenant, dto);
    if (roteiros.length === 0) {
      return null; // 2a (UC21): sem dados, não gera arquivo.
    }
    const linhas = roteiros.flatMap((roteiro) =>
      roteiro.itens.map((item) => [
        roteiro.id,
        roteiro.entregador.nome,
        roteiro.data.toISOString().slice(0, 10),
        item.ordem,
        item.ponto.endereco,
        item.horaChegada?.toISOString() ?? '',
        item.horaSaida?.toISOString() ?? '',
        item.tempoParadoMin ?? '',
      ]),
    );
    return gerarCsv(
      ['RoteiroId', 'Entregador', 'Data', 'Ordem', 'Endereco', 'HoraChegada', 'HoraSaida', 'TempoParadoMin'],
      linhas,
    );
  }
}
