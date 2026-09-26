import { PlanoAssinatura } from '../../../generated/prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class ContratarAssinaturaDto {
  @IsEnum(PlanoAssinatura)
  plano: PlanoAssinatura;

  @IsString()
  @IsNotEmpty()
  empresaNome: string;

  @IsString()
  @IsNotEmpty()
  unidadeNome: string;

  @IsString()
  @IsNotEmpty()
  endereco: string;

  @IsString()
  @IsNotEmpty()
  administradorNome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  senha: string;

  @IsString()
  @Length(16, 19)
  numeroCartao: string;

  @IsString()
  @Length(3, 4)
  cvv: string;

  @IsString()
  @IsNotEmpty()
  validade: string;
}
