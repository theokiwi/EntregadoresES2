import {
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class RegistrarPedidoDto {
  // UC08, fluxo alternativo 2a: endereço precisa ter ao menos um número (ex.: incompleto sem número).
  @IsString()
  @Matches(/\d/, {
    message: 'endereco deve incluir um número (endereço incompleto)',
  })
  endereco: string;

  // Só obrigatórias quando o endereço ainda não existe na base (UC08 inclui UC07).
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsString()
  unidadeId?: string;
}
