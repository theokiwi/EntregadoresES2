import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoteiroStatus } from '../../generated/prisma/client';
import {
  calcularTempoParadoMinutos,
  calcularTempoTotalParadoMinutos,
  ehPontoDePartida,
} from '../common/calculos/tempo-parado';
import { AuditoriaRepository } from '../common/repositorios/auditoria.repository';
import { RoteiroRepository } from '../common/repositorios/roteiro.repository';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CorrigirHorarioDto } from './dto/corrigir-horario.dto';

/** UC16 — Corrigir horário de chegada/saída (inclui UC15 — ADR-013). */
@Injectable()
export class CorrecoesService {
  constructor(
    private readonly roteiros: RoteiroRepository,
    private readonly auditoria: AuditoriaRepository,
  ) {}

  async corrigir(
    tenant: TenantContextService,
    itemRoteiroId: string,
    dto: CorrigirHorarioDto,
  ) {
    const item = await this.roteiros.buscarItemComRoteiro(
      tenant.estabelecimentoId,
      itemRoteiroId,
    );
    if (!item) {
      throw new NotFoundException('Ponto do roteiro não encontrado.');
    }
    // Supervisor local só corrige pontos da própria Unidade; Supervisor geral, de qualquer uma (ADR-004).
    if (tenant.unidadeId && item.roteiro.unidadeId !== tenant.unidadeId) {
      throw new ForbiddenException(
        'Você só pode corrigir pontos da própria Unidade.',
      );
    }

    // Pré-condição: só é possível corrigir um campo já registrado.
    if (!item.horaChegada) {
      throw new BadRequestException(
        'Este ponto ainda não tem chegada registrada.',
      );
    }
    if (dto.campo === 'horaSaida' && !item.horaSaida) {
      throw new BadRequestException(
        'Este ponto ainda não tem saída registrada.',
      );
    }

    const novoValor = new Date(dto.novoValor);
    const chegadaFinal =
      dto.campo === 'horaChegada' ? novoValor : item.horaChegada;
    const saidaFinal = dto.campo === 'horaSaida' ? novoValor : item.horaSaida;

    // 4a: horaSaida deve permanecer posterior a horaChegada.
    if (saidaFinal && saidaFinal <= chegadaFinal) {
      throw new BadRequestException(
        'A hora de saída deve ser posterior à hora de chegada.',
      );
    }

    const valorAnterior = (
      dto.campo === 'horaChegada' ? item.horaChegada : item.horaSaida
    )!.toISOString();

    // UC15, modo "por ponto": recalcula tempoParado — nunca para o ponto de partida (RN01/4b).
    const tempoParadoMin =
      !ehPontoDePartida(item.ordem) && saidaFinal
        ? calcularTempoParadoMinutos(chegadaFinal, saidaFinal)
        : null;

    await this.roteiros.corrigirItem(item.id, {
      ...(dto.campo === 'horaChegada'
        ? { horaChegada: novoValor }
        : { horaSaida: novoValor }),
      tempoParadoMin,
    });

    await this.auditoria.registrar({
      estabelecimentoId: tenant.estabelecimentoId,
      autorId: tenant.usuarioId,
      itemRoteiroId: item.id,
      // ADR-015: notação da spec ("Ponto.horaChegada") refere-se ao ItemRoteiro, que é
      // onde esses campos realmente residem no modelo de classes.
      entidade: 'ItemRoteiro',
      campo: dto.campo,
      valorAnterior,
      valorNovo: novoValor.toISOString(),
      justificativa: dto.justificativa,
    });

    // ADR-013, passo 7: se o Roteiro já está "Finalizado", recalcula o total (RN03);
    // status, distância e custo não são tocados.
    if (item.roteiro.status === RoteiroStatus.FINALIZADO) {
      const itensAtualizados = item.roteiro.itens.map((i) =>
        i.id === item.id ? { ...i, tempoParadoMin } : i,
      );
      const tempoTotalParadoMin =
        calcularTempoTotalParadoMinutos(itensAtualizados);
      await this.roteiros.atualizarTempoTotalParado(
        item.roteiro.id,
        tempoTotalParadoMin,
      );
    }

    return this.roteiros.buscarComItens(
      tenant.estabelecimentoId,
      item.roteiro.id,
    );
  }
}
