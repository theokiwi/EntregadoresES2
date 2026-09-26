/** UC21 — Exportar relatório: gera CSV simples (extend de UC18/UC19). */
function escaparCampo(valor: string | number): string {
  const texto = String(valor);
  return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function gerarCsv(cabecalho: string[], linhas: (string | number)[][]): string {
  const todas = [cabecalho, ...linhas];
  return todas.map((linha) => linha.map(escaparCampo).join(',')).join('\n');
}
