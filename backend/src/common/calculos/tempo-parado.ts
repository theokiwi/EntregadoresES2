/**
 * CalculadoraTempoParado (modelo-projeto.puml) — UC15, serviço de sistema sem boundary,
 * incluído por UC13 (modo "por ponto") e UC14 (modo "total do roteiro").
 */

/** RN02: tempo parado = saída − chegada, em minutos inteiros. */
export function calcularTempoParadoMinutos(
  horaChegada: Date,
  horaSaida: Date,
): number {
  const diffMs = horaSaida.getTime() - horaChegada.getTime();
  return Math.round(diffMs / 60000);
}

/** RN01: o ponto de partida (ordem 1) nunca conta tempo parado. */
export function ehPontoDePartida(ordem: number): boolean {
  return ordem === 1;
}

/** RN03: soma dos tempos parados de todos os pontos, exceto o de partida. */
export function calcularTempoTotalParadoMinutos(
  itens: { ordem: number; tempoParadoMin: number | null }[],
): number {
  return itens
    .filter(
      (item) => !ehPontoDePartida(item.ordem) && item.tempoParadoMin !== null,
    )
    .reduce((total, item) => total + (item.tempoParadoMin ?? 0), 0);
}
