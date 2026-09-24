import { IsInt, Max, Min } from 'class-validator';

export class AtualizarJornadaDto {
  // UC04, passo 4: intervalo válido de 1 a 24 horas.
  @IsInt()
  @Min(1)
  @Max(24)
  jornadaPadraoHoras: number;
}
