/** Normaliza para meia-noite UTC — colunas `@db.Date` não guardam hora. */
export function paraDataSemHora(valor: string | Date): Date {
  const iso = typeof valor === 'string' ? valor : valor.toISOString();
  return new Date(iso.slice(0, 10));
}
