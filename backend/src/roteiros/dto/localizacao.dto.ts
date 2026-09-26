import { Type } from 'class-transformer';
import { IsISO8601, IsNumber, IsUUID, Max, Min } from 'class-validator';

/** Medição produzida pelo sensor de localização do aparelho. */
export class LocalizacaoDto {
  @IsUUID()
  desafioId!: string;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(-90)
  @Max(90)
  latitude!: number;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(-180)
  @Max(180)
  longitude!: number;

  @Type(() => Number)
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(50)
  precisaoMetros!: number;

  @IsISO8601({ strict: true })
  capturadaEm!: string;
}
