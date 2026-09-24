import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/** Isola cada arquivo de teste (rodam com --runInBand) num banco limpo. */
export async function limparBanco(): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE estabelecimentos, unidades, usuarios, parametros, pontos, roteiros, itens_roteiro, auditoria CASCADE',
  );
}
