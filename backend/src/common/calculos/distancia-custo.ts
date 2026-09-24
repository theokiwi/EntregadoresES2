/**
 * CalculadoraDistanciaCusto (modelo-projeto.puml) — UC23, serviço de sistema sem boundary,
 * incluído por UC14 ao finalizar o roteiro. Distância via fórmula de Haversine (ADR-002).
 */

const RAIO_TERRA_KM = 6371;

function paraRadianos(graus: number): number {
  return (graus * Math.PI) / 180;
}

export interface Coordenada {
  latitude: number;
  longitude: number;
}

/** Distância em linha reta entre duas coordenadas (fórmula de Haversine). */
export function calcularDistanciaHaversineKm(
  a: Coordenada,
  b: Coordenada,
): number {
  const dLat = paraRadianos(b.latitude - a.latitude);
  const dLon = paraRadianos(b.longitude - a.longitude);
  const lat1 = paraRadianos(a.latitude);
  const lat2 = paraRadianos(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return RAIO_TERRA_KM * c;
}

/** RN06: soma a distância entre cada par de pontos consecutivos, na ordem do roteiro. */
export function calcularDistanciaTotalKm(
  pontosOrdenados: Coordenada[],
): number {
  let total = 0;
  for (let i = 1; i < pontosOrdenados.length; i++) {
    total += calcularDistanciaHaversineKm(
      pontosOrdenados[i - 1],
      pontosOrdenados[i],
    );
  }
  return total;
}

/** RN07: custo = (distância ÷ rendimento km/litro) × valor do combustível. */
export function calcularCustoEstimado(
  distanciaKm: number,
  rendimentoKmLitro: number,
  valorCombustivel: number,
): number {
  return (distanciaKm / rendimentoKmLitro) * valorCombustivel;
}
