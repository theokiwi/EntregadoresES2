import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsOptional,
  IsNumber,
  Min,
  IsString,
} from 'class-validator';

export class MontarRoteiroDto {
  @IsString()
  entregadorId: string;

  @IsDateString()
  data: string;

  // RN06: ordem sequencial = posição no array (índice 0 é o ponto de partida, RN01).
  @IsArray()
  @ArrayMinSize(1, { message: 'selecione ao menos um ponto para o roteiro' })
  @IsString({ each: true })
  pontoIds: string[];

  @IsOptional()
  @IsString()
  unidadeId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  receitaBruta?: number;
}
