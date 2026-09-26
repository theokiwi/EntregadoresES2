import { DashboardService } from './dashboard.service';

describe('DashboardService — relatório gerencial', () => {
  const data = new Date('2026-09-10T00:00:00.000Z');
  const unidade = { id: 'u1', nome: 'Centro', parametro: { valorCombustivel: 6 } };
  const entregador = { id: 'e1', nome: 'Ana', veiculo: 'Moto 160', tipoCombustivel: 'GASOLINA', rendimentoKmLitro: 20 };
  const roteiro = {
    id: 'r1', data, unidadeId: 'u1', entregadorId: 'e1', unidade, entregador,
    tempoTotalParadoMin: 30, distanciaTotalKm: 100, custoEstimado: 30,
    receitaBruta: 120, horaInicio: new Date('2026-09-10T10:00:00Z'),
    horaTermino: new Date('2026-09-10T12:00:00Z'), itens: [],
  };

  function servico(roteiros = [roteiro], usuarios = [entregador]) {
    return new DashboardService(
      { listarFinalizadosNoPeriodo: jest.fn().mockResolvedValue(roteiros) } as never,
      { unidade: { findMany: jest.fn().mockResolvedValue([{ ...unidade, usuarios }, { id: 'u2', nome: 'Norte', usuarios: [] }]) } } as never,
    );
  }

  const tenant = { estabelecimentoId: 'est1', unidadeId: null } as never;

  it('calcula consumo, custo, receita, lucro e séries em todas as escalas', async () => {
    const resultado = await servico().consultar(tenant, { dataInicial: '2026-09-01', dataFinal: '2026-09-30' });
    expect(resultado.resumo.litrosConsumidos).toBe(5);
    expect(resultado.financeiro).toMatchObject({ custoCombustivel: 30, receitaBruta: 120, lucro: 90, motivoIndisponibilidade: null });
    expect(resultado.series.diaria).toHaveLength(1);
    expect(resultado.series.semanal).toHaveLength(1);
    expect(resultado.series.mensal).toHaveLength(1);
    expect(resultado.series.anual).toHaveLength(1);
    expect(resultado.porEntregador[0]).toMatchObject({ entregadorNome: 'Ana', tipoCombustivel: 'GASOLINA', litrosConsumidos: 5 });
  });

  it('lista unidades sem atividade e não inventa lucro quando falta receita', async () => {
    const resultado = await servico([{ ...roteiro, receitaBruta: null }]).consultar(tenant, { dataInicial: '2026-09-01', dataFinal: '2026-09-30' });
    expect(resultado.porUnidade.map((item) => item.unidadeNome)).toEqual(['Centro', 'Norte']);
    expect(resultado.porUnidade[1].rotasConcluidas).toBe(0);
    expect(resultado.financeiro.lucro).toBeNull();
    expect(resultado.financeiro.motivoIndisponibilidade).toContain('sem receita');
  });

  it('entrega ranking operacional ao entregador sem expor finanças de colegas', async () => {
    const colega = { ...entregador, id: 'e2', nome: 'Bruno' };
    const rotaColega = { ...roteiro, id: 'r2', entregadorId: 'e2', entregador: colega, custoEstimado: 999, receitaBruta: 5000 };
    const resultado = await servico([roteiro, rotaColega], [entregador, colega]).consultarMeuRanking({
      estabelecimentoId: 'est1', unidadeId: 'u1', usuarioId: 'e1',
    } as never);

    expect(resultado.ranking).toHaveLength(2);
    expect(resultado.ranking.find((item) => item.souEu)).toMatchObject({ entregadorId: 'e1', nome: 'Ana' });
    expect(resultado.meuDesempenho).toEqual({ rotasConcluidas: 1, distanciaKm: 100, tempoMedioParadoMin: 30 });
    expect(JSON.stringify(resultado)).not.toMatch(/custo|receita|lucro|renda|combustível/i);
  });
});
