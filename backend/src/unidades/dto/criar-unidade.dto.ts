import { IsNotEmpty, IsString } from 'class-validator';

export class CriarUnidadeDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  endereco: string;

  // Constituição, item 6: fuso horário único por Unidade (ex.: "America/Sao_Paulo").
  @IsString()
  @IsNotEmpty()
  fusoHorario: string;
}
