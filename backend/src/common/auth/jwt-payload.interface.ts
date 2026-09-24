import { Perfil } from '../../../generated/prisma/client';

/** Claims do token de sessão (UC00, passo 4): perfil, estabelecimentoId e unidadeId. */
export interface JwtPayload {
  sub: string;
  perfil: Perfil;
  estabelecimentoId: string;
  unidadeId: string | null;
}
