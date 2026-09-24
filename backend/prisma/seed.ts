// Provisionamento operacional (fora de escopo dos UCs — ver ADR-004/atores.md): cria o
// primeiro Estabelecimento, a primeira Unidade e o primeiro SupervisorGeral para permitir
// o primeiro login. Nenhum UC do sistema cria um Estabelecimento.
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Perfil, PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SENHA_SUPERVISOR_GERAL = 'trocar123';

async function main() {
  const estabelecimento = await prisma.estabelecimento.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      nome: 'Transportes Rápido',
    },
  });

  const unidade = await prisma.unidade.upsert({
    where: {
      estabelecimentoId_nome: {
        estabelecimentoId: estabelecimento.id,
        nome: 'Filial Centro',
      },
    },
    update: {},
    create: {
      estabelecimentoId: estabelecimento.id,
      nome: 'Filial Centro',
      endereco: 'Av. Principal, 1000 - Centro',
      fusoHorario: 'America/Sao_Paulo',
    },
  });

  const supervisorGeral = await prisma.usuario.upsert({
    where: { email: 'admin@transportadora.com' },
    update: {},
    create: {
      estabelecimentoId: estabelecimento.id,
      unidadeId: null,
      email: 'admin@transportadora.com',
      senhaHash: await bcrypt.hash(SENHA_SUPERVISOR_GERAL, 10),
      senhaDefinida: true,
      perfil: Perfil.SUPERVISOR_GERAL,
      nome: 'Administrador',
      ativo: true,
    },
  });

  console.log('Seed aplicado:');
  console.log(
    `  Estabelecimento: ${estabelecimento.nome} (${estabelecimento.id})`,
  );
  console.log(`  Unidade: ${unidade.nome} (${unidade.id})`);
  console.log(
    `  SupervisorGeral: ${supervisorGeral.email} / senha "${SENHA_SUPERVISOR_GERAL}"`,
  );
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
