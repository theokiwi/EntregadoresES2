import { BadRequestException, Injectable } from '@nestjs/common';
import { gerarCsv } from '../common/csv';
import { paraDataSemHora } from '../common/data';
import { RoteiroRepository } from '../common/repositorios/roteiro.repository';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { ConsultarDashboardDto } from './dto/consultar-dashboard.dto';
import { Perfil } from '../../generated/prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';

/** UC18 — Visualizar dashboard de tempo parado (dia/mês/período); UC21 extend (CSV). */
@Injectable()
export class DashboardService {
  constructor(private readonly roteiros: RoteiroRepository, private readonly prisma: PrismaService) {}

  /**
   * Ranking mensal exibido ao entregador. A resposta contém apenas desempenho operacional:
   * nenhum custo, receita, lucro, consumo ou rendimento de colegas deixa o backend.
   */
  async consultarMeuRanking(tenant: TenantContextService) {
    const hoje = new Date();
    const dataInicial = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1));
    const dataFinal = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() + 1, 0));
    const dashboard = await this.consultar(tenant, {
      dataInicial: dataInicial.toISOString().slice(0, 10),
      dataFinal: dataFinal.toISOString().slice(0, 10),
    });

    const participantes = dashboard.porEntregador;
    const maior = (valor: (item: (typeof participantes)[number]) => number) =>
      Math.max(...participantes.map(valor), 1);
    const maxRotas = maior((item) => item.rotasConcluidas);
    const maxDistancia = maior((item) => item.distanciaKm);
    const maxTempoMedio = maior((item) => item.tempoParadoMin / Math.max(item.rotasConcluidas, 1));

    const ranking = participantes
      .map((item) => {
        const tempoMedio = item.tempoParadoMin / Math.max(item.rotasConcluidas, 1);
        const pontuacao = item.rotasConcluidas === 0 ? 0 : Math.round(100 * (
          .5 * item.rotasConcluidas / maxRotas
          + .25 * item.distanciaKm / maxDistancia
          + .25 * (1 - tempoMedio / maxTempoMedio)
        ));
        return { entregadorId: item.entregadorId, nome: item.entregadorNome, pontuacao };
      })
      .sort((a, b) => b.pontuacao - a.pontuacao || a.nome.localeCompare(b.nome))
      .map((item, indice) => ({ ...item, posicao: indice + 1, souEu: item.entregadorId === tenant.usuarioId }));

    const meuDesempenho = participantes.find((item) => item.entregadorId === tenant.usuarioId);
    const minhaPosicao = ranking.find((item) => item.souEu);
    const proximo = minhaPosicao && minhaPosicao.posicao > 1 ? ranking[minhaPosicao.posicao - 2] : null;
    const conquistas = [] as Array<{ codigo: string; titulo: string; descricao: string }>;
    if (minhaPosicao?.posicao === 1 && minhaPosicao.pontuacao > 0) conquistas.push({ codigo: 'LIDER', titulo: 'Líder da equipe', descricao: '1º lugar no ranking mensal' });
    if ((meuDesempenho?.rotasConcluidas ?? 0) >= 10) conquistas.push({ codigo: 'DEZ_ROTAS', titulo: 'Ritmo forte', descricao: '10 rotas concluídas no mês' });
    if ((meuDesempenho?.tempoParadoMin ?? 0) / Math.max(meuDesempenho?.rotasConcluidas ?? 0, 1) <= 30 && (meuDesempenho?.rotasConcluidas ?? 0) > 0) conquistas.push({ codigo: 'AGILIDADE', titulo: 'Entrega ágil', descricao: 'Média de até 30 min parados por rota' });

    return {
      periodo: { dataInicial, dataFinal },
      totalParticipantes: ranking.length,
      minhaPosicao: minhaPosicao?.posicao ?? null,
      minhaPontuacao: minhaPosicao?.pontuacao ?? 0,
      pontosParaSubir: minhaPosicao && proximo ? Math.max(proximo.pontuacao - minhaPosicao.pontuacao + 1, 1) : 0,
      meuDesempenho: {
        rotasConcluidas: meuDesempenho?.rotasConcluidas ?? 0,
        distanciaKm: meuDesempenho?.distanciaKm ?? 0,
        tempoMedioParadoMin: meuDesempenho?.rotasConcluidas ? meuDesempenho.tempoParadoMin / meuDesempenho.rotasConcluidas : 0,
      },
      ranking,
      conquistas,
      criterio: '50% rotas concluídas, 25% distância percorrida e 25% menor tempo parado por rota.',
    };
  }

  private async buscarRoteirosDoRecorte(tenant: TenantContextService, dto: ConsultarDashboardDto) {
    const hoje = paraDataSemHora(new Date());
    const dataInicial = dto.dataInicial ? paraDataSemHora(dto.dataInicial) : hoje;
    const dataFinal = dto.dataFinal ? paraDataSemHora(dto.dataFinal) : hoje;

    // 3a: recorte "período" com data final anterior à inicial.
    if (dataFinal < dataInicial) {
      throw new BadRequestException('A data final deve ser igual ou posterior à data inicial.');
    }

    const unidadeId = tenant.unidadeId ?? dto.unidadeId;
    const roteiros = await this.roteiros.listarFinalizadosNoPeriodo(tenant.estabelecimentoId, {
      unidadeId,
      dataInicial,
      dataFinal,
    });
    return { roteiros, dataInicial, dataFinal };
  }

  async consultar(tenant: TenantContextService, dto: ConsultarDashboardDto) {
    const { roteiros, dataInicial, dataFinal } = await this.buscarRoteirosDoRecorte(tenant, dto);
    const total = roteiros.reduce((soma, r) => soma + (r.tempoTotalParadoMin ?? 0), 0);
    const media = roteiros.length > 0 ? total / roteiros.length : 0;

    const dados = roteiros.map((r) => {
      const distanciaKm = Number(r.distanciaTotalKm ?? 0);
      const rendimentoKmLitro = Number(r.entregador.rendimentoKmLitro ?? 0);
      const litrosConsumidos = rendimentoKmLitro > 0 ? distanciaKm / rendimentoKmLitro : 0;
      const custoCombustivel = Number(r.custoEstimado ?? 0);
      const duracaoMin = r.horaInicio && r.horaTermino
        ? Math.max(0, (r.horaTermino.getTime() - r.horaInicio.getTime()) / 60_000)
        : null;
      const receitaBruta = r.receitaBruta === null ? null : Number(r.receitaBruta);
      return { r, distanciaKm, litrosConsumidos, custoCombustivel, receitaBruta, duracaoMin };
    });

    const somar = (itens: typeof dados) => ({
      rotasConcluidas: itens.length,
      distanciaKm: itens.reduce((s, x) => s + x.distanciaKm, 0),
      tempoParadoMin: itens.reduce((s, x) => s + (x.r.tempoTotalParadoMin ?? 0), 0),
      litrosConsumidos: itens.reduce((s, x) => s + x.litrosConsumidos, 0),
      custoCombustivel: itens.reduce((s, x) => s + x.custoCombustivel, 0),
      receitaBruta: itens.length > 0 && itens.every((x) => x.receitaBruta !== null) ? itens.reduce((s, x) => s + (x.receitaBruta ?? 0), 0) : null,
      lucro: itens.length > 0 && itens.every((x) => x.receitaBruta !== null) ? itens.reduce((s, x) => s + (x.receitaBruta ?? 0) - x.custoCombustivel, 0) : null,
      duracaoMediaMin: itens.some((x) => x.duracaoMin !== null)
        ? itens.reduce((s, x) => s + (x.duracaoMin ?? 0), 0) / itens.filter((x) => x.duracaoMin !== null).length
        : null,
    });

    const agrupar = (chave: (item: (typeof dados)[number]) => string, base = dados) =>
      Array.from(base.reduce((mapa, item) => {
        const k = chave(item);
        mapa.set(k, [...(mapa.get(k) ?? []), item]);
        return mapa;
      }, new Map<string, typeof dados>()))
        .map(([periodo, itens]) => ({ periodo, ...somar(itens) }))
        .sort((a, b) => a.periodo.localeCompare(b.periodo));

    const semana = (data: Date) => {
      const d = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()));
      const dia = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dia);
      const inicioAno = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const numero = Math.ceil((((d.getTime() - inicioAno.getTime()) / 86400000) + 1) / 7);
      return `${d.getUTCFullYear()}-S${String(numero).padStart(2, '0')}`;
    };

    const desempenhoEntregadores = Array.from(dados.reduce((mapa, item) => {
      const atual = mapa.get(item.r.entregadorId) ?? [];
      mapa.set(item.r.entregadorId, [...atual, item]);
      return mapa;
    }, new Map<string, typeof dados>())).map(([entregadorId, itens]) => ({
      entregadorId,
      entregadorNome: itens[0].r.entregador.nome,
      unidadeId: itens[0].r.unidadeId,
      unidadeNome: itens[0].r.unidade.nome,
      veiculo: itens[0].r.entregador.veiculo,
      rendimentoKmLitro: Number(itens[0].r.entregador.rendimentoKmLitro ?? 0),
      tipoCombustivel: itens[0].r.entregador.tipoCombustivel,
      series: { diaria: agrupar((x) => x.r.data.toISOString().slice(0, 10), itens), semanal: agrupar((x) => semana(x.r.data), itens), mensal: agrupar((x) => x.r.data.toISOString().slice(0, 7), itens), anual: agrupar((x) => String(x.r.data.getUTCFullYear()), itens) },
      ...somar(itens),
    }));

    const unidadesCadastradas = await this.prisma.unidade.findMany({
      where: { estabelecimentoId: tenant.estabelecimentoId, ...(tenant.unidadeId ? { id: tenant.unidadeId } : dto.unidadeId ? { id: dto.unidadeId } : {}) },
      include: { usuarios: { where: { perfil: Perfil.ENTREGADOR, ativo: true }, orderBy: { nome: 'asc' } } },
      orderBy: { nome: 'asc' },
    });
    const vazio = somar([]);
    const porEntregador = unidadesCadastradas.flatMap((unidade) => unidade.usuarios.map((entregador) => {
      const desempenho = desempenhoEntregadores.find((item) => item.entregadorId === entregador.id);
      return desempenho ?? { entregadorId: entregador.id, entregadorNome: entregador.nome, unidadeId: unidade.id, unidadeNome: unidade.nome, veiculo: entregador.veiculo, tipoCombustivel: entregador.tipoCombustivel, rendimentoKmLitro: Number(entregador.rendimentoKmLitro ?? 0), series: { diaria: [], semanal: [], mensal: [], anual: [] }, ...vazio };
    })).sort((a, b) => b.rotasConcluidas - a.rotasConcluidas || a.entregadorNome.localeCompare(b.entregadorNome));

    const porUnidade = unidadesCadastradas.map((unidade) => {
      const itens = dados.filter((item) => item.r.unidadeId === unidade.id);
      return { unidadeId: unidade.id, unidadeNome: unidade.nome, entregadores: porEntregador.filter((e) => e.unidadeId === unidade.id), series: { diaria: agrupar((x) => x.r.data.toISOString().slice(0, 10), itens), semanal: agrupar((x) => semana(x.r.data), itens), mensal: agrupar((x) => x.r.data.toISOString().slice(0, 7), itens), anual: agrupar((x) => String(x.r.data.getUTCFullYear()), itens) }, ...somar(itens) };
    });

    return {
      // 4a: lista vazia → frontend exibe "Nenhum dado disponível para o período selecionado".
      roteiros: roteiros.map((r) => ({
        id: r.id,
        data: r.data,
        entregadorNome: r.entregador.nome,
        unidadeId: r.unidadeId,
        unidadeNome: r.unidade.nome,
        tempoTotalParadoMin: r.tempoTotalParadoMin,
        distanciaKm: Number(r.distanciaTotalKm ?? 0),
        litrosConsumidos: Number(r.entregador.rendimentoKmLitro ?? 0) > 0 ? Number(r.distanciaTotalKm ?? 0) / Number(r.entregador.rendimentoKmLitro) : 0,
        custoCombustivel: Number(r.custoEstimado ?? 0),
      })),
      total,
      media,
      periodo: { dataInicial, dataFinal },
      resumo: somar(dados),
      porEntregador,
      porUnidade,
      series: {
        diaria: agrupar((x) => x.r.data.toISOString().slice(0, 10)),
        semanal: agrupar((x) => semana(x.r.data)),
        mensal: agrupar((x) => x.r.data.toISOString().slice(0, 7)),
        anual: agrupar((x) => String(x.r.data.getUTCFullYear())),
      },
      financeiro: { custoCombustivel: somar(dados).custoCombustivel, receitaBruta: somar(dados).receitaBruta, lucro: somar(dados).lucro, motivoIndisponibilidade: dados.some((x) => x.receitaBruta === null) ? 'Há roteiros sem receita informada; complete esses registros para calcular o resultado do período.' : null },
    };
  }

  async exportarCsv(tenant: TenantContextService, dto: ConsultarDashboardDto): Promise<string | null> {
    const { roteiros } = await this.buscarRoteirosDoRecorte(tenant, dto);
    if (roteiros.length === 0) {
      return null; // 2a (UC21): sem dados, não gera arquivo.
    }
    const linhas = roteiros.map((r) => {
      const distancia = Number(r.distanciaTotalKm ?? 0);
      const rendimento = Number(r.entregador.rendimentoKmLitro ?? 0);
      return [
      r.id,
      r.unidade.nome,
      r.entregador.nome,
      r.data.toISOString().slice(0, 10),
      r.entregador.veiculo ?? '',
      r.entregador.tipoCombustivel ?? 'NAO_INFORMADO',
      rendimento || '',
      distancia,
      rendimento > 0 ? (distancia / rendimento).toFixed(3) : '',
      Number(r.custoEstimado ?? 0).toFixed(2),
      r.receitaBruta === null ? '' : Number(r.receitaBruta).toFixed(2),
      r.receitaBruta === null ? '' : (Number(r.receitaBruta) - Number(r.custoEstimado ?? 0)).toFixed(2),
      r.tempoTotalParadoMin ?? 0,
    ]; });
    return gerarCsv(['RoteiroId', 'Unidade', 'Entregador', 'Data', 'Veiculo', 'Combustivel', 'RendimentoKmLitro', 'DistanciaKm', 'LitrosEstimados', 'CustoCombustivel', 'ReceitaBruta', 'LucroPrejuizo', 'TempoTotalParadoMin'], linhas);
  }
}
