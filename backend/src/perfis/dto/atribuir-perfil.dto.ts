import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Perfil } from '../../../generated/prisma/client';

export class AtribuirPerfilDto {
  @IsEnum(Perfil)
  perfil: Perfil;

  // Obrigatório exceto quando perfil = SUPERVISOR_GERAL (ADR-014).
  @IsOptional()
  @IsString()
  unidadeId?: string | null;
}
