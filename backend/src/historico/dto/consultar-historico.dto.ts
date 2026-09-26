import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class ConsultarHistoricoDto {
  @IsDateString()
  dataInicial: string;

  @IsDateString()
  dataFinal: string;

  @IsOptional()
  @IsString()
  entregadorId?: string;

  @IsOptional()
  @IsString()
  unidadeId?: string;

  // UC21 («extend» de UC19): mesmo filtro, saída em CSV.
  @IsOptional()
  @IsIn(['csv'])
  formato?: 'csv';
}
