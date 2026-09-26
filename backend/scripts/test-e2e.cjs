const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { Client } = require('pg');
require('dotenv').config();

const desenvolvimento = new URL(process.env.DATABASE_URL);
const teste = process.env.TEST_DATABASE_URL
  ? new URL(process.env.TEST_DATABASE_URL)
  : new URL(process.env.DATABASE_URL);

if (!process.env.TEST_DATABASE_URL) {
  const nomeBase = teste.pathname.replace(/^\//, '');
  teste.pathname = `/${nomeBase}_e2e`;
  teste.searchParams.set('schema', 'public');
}

const bancoDesenvolvimento = desenvolvimento.pathname.replace(/^\//, '');
const bancoTeste = teste.pathname.replace(/^\//, '');
if (!bancoTeste || bancoTeste === bancoDesenvolvimento) {
  console.error(
    'Teste E2E recusado: TEST_DATABASE_URL precisa apontar para outro banco PostgreSQL.',
  );
  process.exit(1);
}
if (!/^[a-zA-Z0-9_]+$/.test(bancoTeste)) {
  console.error('Teste E2E recusado: nome do banco de testes inválido.');
  process.exit(1);
}

const env = {
  ...process.env,
  DATABASE_URL: teste.toString(),
  E2E_DATABASE_GUARD: 'isolated-database',
};
const executar = (comando, argumentos) => {
  const resultado = spawnSync(comando, argumentos, {
    cwd: path.resolve(__dirname, '..'),
    env,
    stdio: 'inherit',
  });
  if (resultado.error) throw resultado.error;
  if (resultado.status !== 0) process.exit(resultado.status ?? 1);
};

async function main() {
  const administrativa = new URL(teste);
  administrativa.pathname = '/postgres';
  administrativa.searchParams.delete('schema');
  const cliente = new Client({ connectionString: administrativa.toString() });
  await cliente.connect();
  const existente = await cliente.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [bancoTeste],
  );
  if (existente.rowCount === 0) {
    await cliente.query(`CREATE DATABASE "${bancoTeste}"`);
  }
  await cliente.end();

  console.log(`Executando E2E no banco isolado "${bancoTeste}".`);
  executar(process.execPath, ['scripts/prisma-migrate.cjs']);
  executar(process.execPath, [
    require.resolve('jest/bin/jest'),
    '--config',
    './test/jest-e2e.json',
    '--runInBand',
  ]);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
