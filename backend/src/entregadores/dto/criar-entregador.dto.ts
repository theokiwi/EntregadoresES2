import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';
import { TipoCombustivel } from '../../../generated/prisma/client';

export class CriarEntregadorDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  // UC06 (seção 8) não coleta e-mail, mas UC00 exige e-mail/senha para todo Usuario,
  // incluindo Entregador — opcional aqui; se omitido, um e-mail sintético é gerado a
  // partir do documento (o Supervisor pode ajustar depois via UC05, se necessário).
  @IsOptional()
  @IsEmail()
  email?: string;

  // UC06, seção 8: formato "(DD) 9XXXX-XXXX".
  @IsString()
  @Matches(/^\(\d{2}\) 9\d{4}-\d{4}$/, {
    message: 'telefone deve seguir o formato (DD) 9XXXX-XXXX',
  })
  telefone: string;

  // CPF: aceita com ou sem máscara, normaliza para 11 dígitos antes de validar/gravar.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @Matches(/^\d{11}$/, { message: 'documento deve ser um CPF com 11 dígitos' })
  documento: string;

  @IsString()
  @IsNotEmpty()
  veiculo: string;

  @IsOptional()
  @IsEnum(TipoCombustivel)
  tipoCombustivel?: TipoCombustivel;

  @IsPositive()
  rendimentoKmLitro: number;

  // Obrigatório apenas quando o autor é Supervisor geral (sem Unidade fixa).
  @IsOptional()
  @IsString()
  unidadeId?: string;
}
