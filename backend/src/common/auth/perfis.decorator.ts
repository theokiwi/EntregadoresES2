import { SetMetadata } from '@nestjs/common';
import { Perfil } from '../../../generated/prisma/client';

export const PERFIS_KEY = 'perfis';

/** Restringe uma rota a um ou mais perfis (RNF04, ADR-012). */
export const Perfis = (...perfis: Perfil[]) => SetMetadata(PERFIS_KEY, perfis);
