import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class ConsultarDashboardDto {
  // UC18, passo 2: default é o recorte "dia" (data corrente) quando omitido.
  @IsOptional()
  @IsDateString()
  dataInicial?: string;

  @IsOptional()
  @IsDateString()
  dataFinal?: string;

  @IsOptional()
  @IsString()
  unidadeId?: string;

  // UC21 («extend» de UC18): mesmo filtro, saída em CSV.
  @IsOptional()
  @IsIn(['csv'])
  formato?: 'csv';
}
