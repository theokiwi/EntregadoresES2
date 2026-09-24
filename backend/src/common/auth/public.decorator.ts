import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marca uma rota como isenta de autenticação (só UC00 — login). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
