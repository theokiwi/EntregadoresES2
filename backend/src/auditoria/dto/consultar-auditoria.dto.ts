import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ConsultarAuditoriaDto {
  // UC17, fluxo alternativo 2a: sem período informado, aplica os últimos 30 dias.
  @IsOptional()
  @IsDateString()
  dataInicial?: string;

  @IsOptional()
  @IsDateString()
  dataFinal?: string;

  // Só relevante para Supervisor geral, que não tem Unidade fixa (ADR-014).
  @IsOptional()
  @IsString()
  unidadeId?: string;
}
