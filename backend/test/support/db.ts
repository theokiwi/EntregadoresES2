import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/** Isola cada arquivo no banco E2E. O runner impede o uso do banco de desenvolvimento. */
export async function limparBanco(): Promise<void> {
  if (process.env.E2E_DATABASE_GUARD !== 'isolated-database') {
    throw new Error(
      'Proteção E2E: limpeza recusada fora do banco de teste isolado.',
    );
  }
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE estabelecimentos, unidades, usuarios, parametros, pontos, roteiros, itens_roteiro, auditoria CASCADE',
  );
}
