import { PlanoAssinatura } from '../../generated/prisma/client';

export const PLANOS = {
  [PlanoAssinatura.ESSENCIAL]: {
    nome: 'Essencial',
    valorMensal: 149,
    limiteEntregadores: 5,
    limiteUnidades: 1,
    destaque: false,
  },
  [PlanoAssinatura.PROFISSIONAL]: {
    nome: 'Profissional',
    valorMensal: 299,
    limiteEntregadores: 20,
    limiteUnidades: 3,
    destaque: true,
  },
  [PlanoAssinatura.ESCALA]: {
    nome: 'Escala',
    valorMensal: 599,
    limiteEntregadores: 60,
    limiteUnidades: 10,
    destaque: false,
  },
} as const;
