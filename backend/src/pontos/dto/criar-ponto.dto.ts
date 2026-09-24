import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CriarPontoDto {
  @IsString()
  @IsNotEmpty()
  endereco: string;

  // ADR-009: coordenadas obrigatórias, dentro da faixa geográfica válida.
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  // Obrigatório apenas quando o autor é Supervisor geral (sem Unidade fixa).
  @IsOptional()
  @IsString()
  unidadeId?: string;
}
