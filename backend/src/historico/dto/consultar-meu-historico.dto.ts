import { IsDateString } from 'class-validator';

export class ConsultarMeuHistoricoDto {
  @IsDateString()
  dataInicial: string;

  @IsDateString()
  dataFinal: string;
}
