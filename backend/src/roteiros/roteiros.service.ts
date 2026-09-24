import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ItemRoteiroStatus,
  Perfil,
  RoteiroStatus,
} from '../../generated/prisma/client';
import {
  calcularCustoEstimado,
  calcularDistanciaTotalKm,
} from '../common/calculos/distancia-custo';
import {
  calcularTempoParadoMinutos,
  calcularTempoTotalParadoMinutos,
  ehPontoDePartida,
} from '../common/calculos/tempo-parado';
import { ParametroRepository } from '../common/repositorios/parametro.repository';
import { PontoRepository } from '../common/repositorios/ponto.repository';
import {
  RoteiroComItens,
  RoteiroRepository,
} from '../common/repositorios/roteiro.repository';
import { UnidadeRepository } from '../common/repositorios/unidade.repository';
import { UsuarioRepository } from '../common/repositorios/usuario.repository';
import { resolverUnidadeAlvo } from '../common/tenant/resolver-unidade-alvo';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { MontarRoteiroDto } from './dto/montar-roteiro.dto';

/** Normaliza para meia-noite UTC — coluna @db.Date não guarda hora. */
function paraDataSemHora(valor: string | Date): Date {
  const iso = typeof valor === 'string' ? valor : valor.toISOString();
  return new Date(iso.slice(0, 10));
}

/**
 * UC09 — Montar roteiro diário; UC10 — Consultar roteiro do dia; UC11 — Iniciar roteiro;
 * UC12 — Registrar chegada; UC13 — Registrar saída (inclui UC15); UC14 — Finalizar
 * roteiro (inclui UC15 modo total e UC23).
 */
@Injectable()
export class RoteirosService {
  constructor(
    private readonly roteiros: RoteiroRepository,
    private readonly pontos: PontoRepository,
    private readonly unidades: UnidadeRepository,
    private readonly usuarios: UsuarioRepository,
    private readonly parametros: ParametroRepository,
  ) {}

  async montar(tenant: TenantContextService, dto: MontarRoteiroDto) {
    const unidadeId = await resolverUnidadeAlvo(
      tenant,
      this.unidades,
      dto.unidadeId,
    );

    const entregador = await this.usuarios.findById(
      tenant.estabelecimentoId,
      dto.entregadorId,
    );
    if (
      !entregador ||
      entregador.perfil !== Perfil.ENTREGADOR ||
      entregador.unidadeId !== unidadeId
    ) {
      throw new BadRequestException('Entregador não encontrado nesta Unidade.');
    }

    const data = paraDataSemHora(dto.data);

    // RN05, fluxo alternativo 2a.
    const existente = await this.roteiros.findByEntregadorEData(
      entregador.id,
      data,
    );
    if (existente) {
      throw new ConflictException(
        'Este Entregador já possui um roteiro para essa data. Edite o roteiro existente.',
      );
    }

    const pontosValidos = await this.pontos.listByIds(
      tenant.estabelecimentoId,
      unidadeId,
      dto.pontoIds,
    );
    if (pontosValidos.length !== new Set(dto.pontoIds).size) {
      throw new BadRequestException(
        'Um ou mais pontos não pertencem a esta Unidade.',
      );
    }

    return this.roteiros.criar({
      estabelecimentoId: tenant.estabelecimentoId,
      unidadeId,
      entregadorId: entregador.id,
      data,
      pontoIds: dto.pontoIds,
    });
  }

  // UC10 — só o próprio Entregador consulta o próprio roteiro (ADR-003, RNF06).
  // Resposta sempre envelopada em `{ roteiro }`: Express serializa `null` cru como corpo
  // vazio (não como JSON `null`), o que o cliente não conseguiria distinguir de um erro.
  async consultarDoDia(tenant: TenantContextService) {
    const hoje = paraDataSemHora(new Date());
    const roteiro = await this.roteiros.buscarDoEntregadorNaData(
      tenant.estabelecimentoId,
      tenant.usuarioId,
      hoje,
    );
    return { roteiro }; // roteiro: null → frontend exibe "Nenhum roteiro disponível para hoje" (fluxo 2a).
  }

  async consultarPorId(tenant: TenantContextService, id: string) {
    const roteiro = await this.roteiros.buscarComItens(
      tenant.estabelecimentoId,
      id,
    );
    if (!roteiro) {
      throw new NotFoundException('Roteiro não encontrado.');
    }
    // ADR-003/RNF06: Entregador nunca consulta o roteiro de outro Entregador.
    if (
      tenant.perfil === Perfil.ENTREGADOR &&
      roteiro.entregadorId !== tenant.usuarioId
    ) {
      throw new ForbiddenException('Você só pode consultar o próprio roteiro.');
    }
    return roteiro;
  }

  // UC11–UC14: só o próprio Entregador executa o roteiro (ADR-003).
  private async buscarRoteiroDoProprioEntregador(
    tenant: TenantContextService,
    roteiroId: string,
  ): Promise<RoteiroComItens> {
    const roteiro = await this.roteiros.buscarComItens(
      tenant.estabelecimentoId,
      roteiroId,
    );
    if (!roteiro) {
      throw new NotFoundException('Roteiro não encontrado.');
    }
    if (roteiro.entregadorId !== tenant.usuarioId) {
      throw new ForbiddenException('Você só pode operar o próprio roteiro.');
    }
    return roteiro;
  }

  async iniciar(tenant: TenantContextService, roteiroId: string) {
    const roteiro = await this.buscarRoteiroDoProprioEntregador(
      tenant,
      roteiroId,
    );

    // 3a: já iniciado — mantém o estado atual, sem duplicar.
    if (roteiro.status !== RoteiroStatus.NAO_INICIADO) {
      return roteiro;
    }

    const agora = new Date();
    const partida = roteiro.itens[0];
    await this.roteiros.iniciarRoteiro(roteiro.id, agora);
    // RN01, RN06: ponto de partida (ordem 1) marcado visitado, sem tempo parado.
    await this.roteiros.concluirPontoDePartida(partida.id, agora);

    return this.roteiros.buscarComItens(tenant.estabelecimentoId, roteiroId);
  }

  async registrarChegada(tenant: TenantContextService, itemRoteiroId: string) {
    const item = await this.roteiros.buscarItemComRoteiro(
      tenant.estabelecimentoId,
      itemRoteiroId,
    );
    if (!item) {
      throw new NotFoundException('Ponto do roteiro não encontrado.');
    }
    if (item.roteiro.entregadorId !== tenant.usuarioId) {
      throw new ForbiddenException('Você só pode operar o próprio roteiro.');
    }
    if (item.roteiro.status !== RoteiroStatus.EM_ANDAMENTO) {
      throw new BadRequestException(
        'O roteiro precisa estar em andamento (inicie-o primeiro).',
      );
    }

    // 4a: chegada já registrada para este ponto.
    if (item.status !== ItemRoteiroStatus.PENDENTE) {
      throw new ConflictException('Chegada já registrada para este ponto.');
    }

    // 3a, RN06: só o próximo ponto pendente da sequência pode receber a chegada.
    const proximo = item.roteiro.itens.find(
      (i) => i.status === ItemRoteiroStatus.PENDENTE,
    );
    if (!proximo || proximo.id !== item.id) {
      throw new BadRequestException(
        proximo
          ? `O próximo ponto esperado é o de ordem ${proximo.ordem} (${proximo.ponto.endereco}).`
          : 'Não há próximo ponto pendente.',
      );
    }

    await this.roteiros.registrarChegadaItem(item.id, new Date());
    return this.roteiros.buscarComItens(
      tenant.estabelecimentoId,
      item.roteiroId,
    );
  }

  async registrarSaida(tenant: TenantContextService, itemRoteiroId: string) {
    const item = await this.roteiros.buscarItemComRoteiro(
      tenant.estabelecimentoId,
      itemRoteiroId,
    );
    if (!item) {
      throw new NotFoundException('Ponto do roteiro não encontrado.');
    }
    if (item.roteiro.entregadorId !== tenant.usuarioId) {
      throw new ForbiddenException('Você só pode operar o próprio roteiro.');
    }

    // 2b: chegada ainda não registrada.
    if (item.status === ItemRoteiroStatus.PENDENTE) {
      throw new BadRequestException(
        'Registre a chegada neste ponto antes de registrar a saída.',
      );
    }
    // 2a: saída já registrada.
    if (item.status === ItemRoteiroStatus.CONCLUIDO) {
      throw new ConflictException('Saída já registrada para este ponto.');
    }

    const agora = new Date();
    // UC15, modo "por ponto" (RN01/RN02).
    const tempoParadoMin = ehPontoDePartida(item.ordem)
      ? null
      : calcularTempoParadoMinutos(item.horaChegada!, agora);
    await this.roteiros.registrarSaidaItem(item.id, agora, tempoParadoMin);

    const roteiroAtualizado = await this.roteiros.buscarComItens(
      tenant.estabelecimentoId,
      item.roteiroId,
    );
    const todosConcluidos = roteiroAtualizado!.itens.every(
      (i) => i.status === ItemRoteiroStatus.CONCLUIDO,
    );
    // UC14, gatilho: saída do último ponto finaliza o roteiro automaticamente.
    if (todosConcluidos) {
      return this.finalizarComTotais(tenant, roteiroAtualizado!);
    }
    return roteiroAtualizado;
  }

  async finalizar(tenant: TenantContextService, roteiroId: string) {
    const roteiro = await this.buscarRoteiroDoProprioEntregador(
      tenant,
      roteiroId,
    );

    // 5a: já finalizado — exibe o resumo já calculado, sem reprocessar.
    if (roteiro.status === RoteiroStatus.FINALIZADO) {
      return roteiro;
    }
    if (roteiro.status !== RoteiroStatus.EM_ANDAMENTO) {
      throw new BadRequestException(
        'O roteiro precisa estar em andamento para ser finalizado.',
      );
    }

    // 1a, ADR-011: finalização exige todos os pontos com saída registrada.
    const pendentes = roteiro.itens.filter(
      (item) => item.status !== ItemRoteiroStatus.CONCLUIDO,
    );
    if (pendentes.length > 0) {
      throw new BadRequestException(
        `Ainda há pontos pendentes: ${pendentes.map((item) => `${item.ordem}. ${item.ponto.endereco}`).join(', ')}.`,
      );
    }

    return this.finalizarComTotais(tenant, roteiro);
  }

  // UC15 (modo total) + UC23, incluídos por UC13 (último ponto) ou UC14 (manual).
  private async finalizarComTotais(
    tenant: TenantContextService,
    roteiro: RoteiroComItens,
  ) {
    const tempoTotalParadoMin = calcularTempoTotalParadoMinutos(roteiro.itens);
    const coordenadas = roteiro.itens.map((item) => ({
      latitude: Number(item.ponto.latitude),
      longitude: Number(item.ponto.longitude),
    }));
    const distanciaTotalKm = calcularDistanciaTotalKm(coordenadas);

    const parametro = await this.parametros.findByUnidade(roteiro.unidadeId);
    const rendimentoKmLitro = roteiro.entregador.rendimentoKmLitro;
    if (!parametro || rendimentoKmLitro === null) {
      throw new BadRequestException(
        'Não é possível calcular o custo: parâmetros de custo da Unidade ou rendimento do Entregador não cadastrados.',
      );
    }
    const custoEstimado = calcularCustoEstimado(
      distanciaTotalKm,
      Number(rendimentoKmLitro),
      Number(parametro.valorCombustivel),
    );

    await this.roteiros.finalizar(roteiro.id, {
      horaTermino: new Date(),
      tempoTotalParadoMin,
      distanciaTotalKm,
      custoEstimado,
    });
    return this.roteiros.buscarComItens(tenant.estabelecimentoId, roteiro.id);
  }
}
