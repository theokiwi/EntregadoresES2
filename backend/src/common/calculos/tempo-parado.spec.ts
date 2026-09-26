import {
  calcularTempoParadoMinutos,
  calcularTempoTotalParadoMinutos,
  ehPontoDePartida,
} from './tempo-parado';

describe('calcularTempoParadoMinutos (UC15, RN02)', () => {
  it('retorna a diferença em minutos entre chegada e saída', () => {
    const chegada = new Date('2026-01-15T09:15:00Z');
    const saida = new Date('2026-01-15T09:30:00Z');
    expect(calcularTempoParadoMinutos(chegada, saida)).toBe(15);
  });
});

describe('ehPontoDePartida (RN01)', () => {
  it('considera o ponto de ordem 1 como ponto de partida', () => {
    expect(ehPontoDePartida(1)).toBe(true);
    expect(ehPontoDePartida(2)).toBe(false);
  });
});

describe('calcularTempoTotalParadoMinutos (UC15, modo total — RN03)', () => {
  it('soma os tempos parados de todos os pontos, exceto o de partida', () => {
    const itens = [
      { ordem: 1, tempoParadoMin: null },
      { ordem: 2, tempoParadoMin: 15 },
      { ordem: 3, tempoParadoMin: 10 },
      { ordem: 4, tempoParadoMin: 50 },
    ];
    expect(calcularTempoTotalParadoMinutos(itens)).toBe(75);
  });

  it('ignora o ponto de partida mesmo que tenha um valor de tempoParadoMin', () => {
    const itens = [
      { ordem: 1, tempoParadoMin: 999 },
      { ordem: 2, tempoParadoMin: 5 },
    ];
    expect(calcularTempoTotalParadoMinutos(itens)).toBe(5);
  });
});
