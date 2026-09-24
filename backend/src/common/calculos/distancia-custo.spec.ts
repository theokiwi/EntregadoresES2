import {
  calcularCustoEstimado,
  calcularDistanciaHaversineKm,
  calcularDistanciaTotalKm,
} from './distancia-custo';

describe('calcularDistanciaHaversineKm (ADR-002)', () => {
  it('retorna aproximadamente 0 para o mesmo ponto', () => {
    const ponto = { latitude: -19.921, longitude: -43.937 };
    expect(calcularDistanciaHaversineKm(ponto, ponto)).toBeCloseTo(0, 5);
  });

  it('calcula ~111.2 km para 1 grau de longitude no equador (raio da Terra = 6371 km)', () => {
    const a = { latitude: 0, longitude: 0 };
    const b = { latitude: 0, longitude: 1 };
    // Comprimento de 1° de arco no equador: (2π × 6371) / 360.
    const esperado = (2 * Math.PI * 6371) / 360;
    expect(calcularDistanciaHaversineKm(a, b)).toBeCloseTo(esperado, 1);
  });
});

describe('calcularDistanciaTotalKm (RN06)', () => {
  it('soma a distância entre pares consecutivos na ordem informada', () => {
    const a = { latitude: 0, longitude: 0 };
    const b = { latitude: 0, longitude: 1 };
    const c = { latitude: 0, longitude: 2 };
    const total = calcularDistanciaTotalKm([a, b, c]);
    const parcial =
      calcularDistanciaHaversineKm(a, b) + calcularDistanciaHaversineKm(b, c);
    expect(total).toBeCloseTo(parcial, 6);
  });

  it('retorna 0 para uma lista com um único ponto', () => {
    expect(calcularDistanciaTotalKm([{ latitude: 0, longitude: 0 }])).toBe(0);
  });
});

describe('calcularCustoEstimado (RN07)', () => {
  it('calcula custo = (distância ÷ rendimento) × valor do combustível', () => {
    expect(calcularCustoEstimado(42, 12, 6.0)).toBeCloseTo(21.0, 6);
  });
});
