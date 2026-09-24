import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CriarSupervisorDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  unidadeId: string;
}
