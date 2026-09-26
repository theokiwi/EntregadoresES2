import { IsIn, IsUUID } from 'class-validator';

export const TIPOS_DESAFIO_LOCALIZACAO = [
  'INICIAR_ROTEIRO',
  'REGISTRAR_CHEGADA',
  'REGISTRAR_SAIDA',
] as const;

export type TipoDesafioLocalizacao = (typeof TIPOS_DESAFIO_LOCALIZACAO)[number];

export class CriarDesafioLocalizacaoDto {
  @IsIn(TIPOS_DESAFIO_LOCALIZACAO)
  tipo!: TipoDesafioLocalizacao;

  @IsUUID()
  alvoId!: string;
}
