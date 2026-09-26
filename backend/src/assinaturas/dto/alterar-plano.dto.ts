import { PlanoAssinatura } from '../../../generated/prisma/client';
import { IsEnum } from 'class-validator';

export class AlterarPlanoDto {
  @IsEnum(PlanoAssinatura)
  plano: PlanoAssinatura;
}
