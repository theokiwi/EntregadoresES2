const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

const env = { ...process.env };
const engine = resolve(
  __dirname,
  '../node_modules/@prisma/engines/schema-engine-debian-openssl-3.0.x',
);

// O Prisma não reconhece algumas distribuições (como NixOS), embora o binário
// Linux compatível já esteja instalado pelo pacote @prisma/engines.
if (!env.PRISMA_SCHEMA_ENGINE_BINARY && existsSync(engine)) {
  env.PRISMA_SCHEMA_ENGINE_BINARY = engine;
}

const comando = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const resultado = spawnSync(comando, ['prisma', 'migrate', 'deploy'], {
  cwd: resolve(__dirname, '..'),
  env,
  stdio: 'inherit',
});

if (resultado.error) throw resultado.error;
process.exit(resultado.status ?? 1);
