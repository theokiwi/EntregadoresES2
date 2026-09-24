import { IsDateString, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CorrigirHorarioDto {
  @IsIn(['horaChegada', 'horaSaida'])
  campo: 'horaChegada' | 'horaSaida';

  @IsDateString()
  novoValor: string;

  // UC16, fluxo alternativo 3a: justificativa obrigatória.
  @IsString()
  @IsNotEmpty()
  justificativa: string;
}
