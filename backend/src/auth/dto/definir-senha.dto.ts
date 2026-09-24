import { IsString, MinLength } from 'class-validator';

export class DefinirSenhaDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  novaSenha: string;
}
