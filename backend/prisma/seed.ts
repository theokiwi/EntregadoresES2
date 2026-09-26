/**
 * Base demonstrativa idempotente.
 * Cria usuários, duas unidades, pontos e quatro anos de rotas para testar todos os fluxos,
 * especialmente dashboard, histórico, custos e execução pelo entregador.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import {
  ItemRoteiroStatus,
  Perfil,
  PlanoAssinatura,
  PrismaClient,
  RoteiroStatus,
  TipoCombustivel,
} from '../generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const SENHA_DEMO = 'Demo@123';
const ESTABELECIMENTO_ID = '00000000-0000-0000-0000-000000000001';
const CENTRO_ID = '10000000-0000-0000-0000-000000000001';
const NORTE_ID = '10000000-0000-0000-0000-000000000002';
const ADMIN_ID = '20000000-0000-0000-0000-000000000001';
const SUPERVISOR_ID = '20000000-0000-0000-0000-000000000002';
const SUPERVISOR_NORTE_ID = '20000000-0000-0000-0000-000000000003';
const ENTREGADORES = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    nome: 'João Silva',
    email: 'joao@demo.com',
    documento: '111.111.111-11',
    veiculo: 'Honda CG 160',
    rendimento: 35,
    combustivel: TipoCombustivel.GASOLINA,
    unidadeId: CENTRO_ID,
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    nome: 'Mariana Costa',
    email: 'mariana@demo.com',
    documento: '222.222.222-22',
    veiculo: 'Yamaha Factor 150',
    rendimento: 38,
    combustivel: TipoCombustivel.GASOLINA,
    unidadeId: CENTRO_ID,
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    nome: 'Carlos Souza',
    email: 'carlos@demo.com',
    documento: '333.333.333-33',
    veiculo: 'Fiat Fiorino',
    rendimento: 11,
    combustivel: TipoCombustivel.DIESEL,
    unidadeId: CENTRO_ID,
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    nome: 'Beatriz Almeida',
    email: 'beatriz@demo.com',
    documento: '444.444.444-44',
    veiculo: 'Honda Biz 125',
    rendimento: 42,
    combustivel: TipoCombustivel.GASOLINA,
    unidadeId: NORTE_ID,
  },
  {
    id: '30000000-0000-0000-0000-000000000005',
    nome: 'Rafael Nunes',
    email: 'rafael@demo.com',
    documento: '555.555.555-55',
    veiculo: 'Renault Kangoo',
    rendimento: 10.5,
    combustivel: TipoCombustivel.DIESEL,
    unidadeId: NORTE_ID,
  },
  {
    id: '30000000-0000-0000-0000-000000000006',
    nome: 'Larissa Rocha',
    email: 'larissa@demo.com',
    documento: '666.666.666-66',
    veiculo: 'Yamaha Fazer 250',
    rendimento: 31,
    combustivel: TipoCombustivel.GASOLINA,
    unidadeId: NORTE_ID,
  },
];
const PONTOS = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    endereco: 'Hub Centro — Av. do Contorno, 1200',
    latitude: -19.9245,
    longitude: -43.9352,
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    endereco: 'Rua da Bahia, 1148 — Centro',
    latitude: -19.9241,
    longitude: -43.9384,
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    endereco: 'Av. Afonso Pena, 1500 — Centro',
    latitude: -19.9272,
    longitude: -43.9374,
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    endereco: 'Rua Pernambuco, 900 — Savassi',
    latitude: -19.9369,
    longitude: -43.9353,
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    endereco: 'Av. Brasil, 620 — Santa Efigênia',
    latitude: -19.9268,
    longitude: -43.9239,
  },
  {
    id: '40000000-0000-0000-0000-000000000006',
    endereco: 'Rua Pium-í, 780 — Sion',
    latitude: -19.9497,
    longitude: -43.9341,
  },
  {
    id: '40000000-0000-0000-0000-000000000007',
    endereco: 'Hub Norte — Av. Cristiano Machado, 4000',
    latitude: -19.86521,
    longitude: -43.92762,
  },
  {
    id: '40000000-0000-0000-0000-000000000008',
    endereco: 'Av. Portugal, 3100 — Itapoã',
    latitude: -19.84482,
    longitude: -43.96321,
  },
  {
    id: '40000000-0000-0000-0000-000000000009',
    endereco: 'Rua Padre Pedro Pinto, 1450 — Venda Nova',
    latitude: -19.81648,
    longitude: -43.95411,
  },
  {
    id: '40000000-0000-0000-0000-000000000010',
    endereco: 'Av. Guarapari, 980 — Santa Amélia',
    latitude: -19.83391,
    longitude: -43.96954,
  },
  {
    id: '40000000-0000-0000-0000-000000000011',
    endereco: 'Av. Sebastião de Brito, 720 — Dona Clara',
    latitude: -19.85631,
    longitude: -43.95217,
  },
  {
    id: '40000000-0000-0000-0000-000000000012',
    endereco: 'Rua dos Expedicionários, 1100 — São Luiz',
    latitude: -19.85872,
    longitude: -43.9804,
  },
];

function dataDiasAtras(dias: number, hora = 0, minuto = 0) {
  const data = new Date();
  data.setUTCHours(hora, minuto, 0, 0);
  data.setUTCDate(data.getUTCDate() - dias);
  return data;
}

function comHorario(data: Date, hora: number, minuto: number) {
  return new Date(
    Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth(),
      data.getUTCDate(),
      hora,
      minuto,
    ),
  );
}

async function usuario(
  dados: Parameters<typeof prisma.usuario.upsert>[0]['create'],
) {
  return prisma.usuario.upsert({
    where: { email: dados.email },
    update: { ...dados },
    create: dados,
  });
}

async function main() {
  const senhaHash = await bcrypt.hash(SENHA_DEMO, 10);
  await prisma.estabelecimento.upsert({
    where: { id: ESTABELECIMENTO_ID },
    update: { nome: 'RotaÁgil Logística' },
    create: { id: ESTABELECIMENTO_ID, nome: 'RotaÁgil Logística' },
  });
  const proximaCobranca = new Date();
  proximaCobranca.setMonth(proximaCobranca.getMonth() + 1);
  await prisma.assinatura.upsert({
    where: { estabelecimentoId: ESTABELECIMENTO_ID },
    update: {
      plano: PlanoAssinatura.PROFISSIONAL,
      valorMensal: 299,
      proximaCobranca,
    },
    create: {
      estabelecimentoId: ESTABELECIMENTO_ID,
      plano: PlanoAssinatura.PROFISSIONAL,
      valorMensal: 299,
      proximaCobranca,
      pagamentoMock: true,
      cartaoFinal: '4242',
    },
  });
  await prisma.unidade.upsert({
    where: { id: CENTRO_ID },
    update: {
      nome: 'Unidade Centro',
      endereco: 'Av. do Contorno, 1200 — Belo Horizonte',
      fusoHorario: 'America/Sao_Paulo',
    },
    create: {
      id: CENTRO_ID,
      estabelecimentoId: ESTABELECIMENTO_ID,
      nome: 'Unidade Centro',
      endereco: 'Av. do Contorno, 1200 — Belo Horizonte',
      fusoHorario: 'America/Sao_Paulo',
    },
  });
  await prisma.unidade.upsert({
    where: { id: NORTE_ID },
    update: {
      nome: 'Unidade Norte',
      endereco: 'Av. Cristiano Machado, 4000 — Belo Horizonte',
      fusoHorario: 'America/Sao_Paulo',
    },
    create: {
      id: NORTE_ID,
      estabelecimentoId: ESTABELECIMENTO_ID,
      nome: 'Unidade Norte',
      endereco: 'Av. Cristiano Machado, 4000 — Belo Horizonte',
      fusoHorario: 'America/Sao_Paulo',
    },
  });
  await prisma.parametro.upsert({
    where: { unidadeId: CENTRO_ID },
    update: { valorCombustivel: 6.19, custoPorKm: 0.72, jornadaPadraoHoras: 8 },
    create: {
      unidadeId: CENTRO_ID,
      valorCombustivel: 6.19,
      custoPorKm: 0.72,
      jornadaPadraoHoras: 8,
    },
  });
  await prisma.parametro.upsert({
    where: { unidadeId: NORTE_ID },
    update: { valorCombustivel: 6.19, custoPorKm: 0.76, jornadaPadraoHoras: 8 },
    create: {
      unidadeId: NORTE_ID,
      valorCombustivel: 6.19,
      custoPorKm: 0.76,
      jornadaPadraoHoras: 8,
    },
  });

  await usuario({
    id: ADMIN_ID,
    estabelecimentoId: ESTABELECIMENTO_ID,
    unidadeId: null,
    email: 'admin@demo.com',
    senhaHash,
    senhaDefinida: true,
    perfil: Perfil.SUPERVISOR_GERAL,
    nome: 'Ana Administradora',
    telefone: '(31) 99999-1000',
    ativo: true,
  });
  await usuario({
    id: SUPERVISOR_ID,
    estabelecimentoId: ESTABELECIMENTO_ID,
    unidadeId: CENTRO_ID,
    email: 'supervisor@demo.com',
    senhaHash,
    senhaDefinida: true,
    perfil: Perfil.SUPERVISOR_LOCAL,
    nome: 'Bruno Supervisor',
    telefone: '(31) 99999-2000',
    ativo: true,
  });
  await usuario({
    id: SUPERVISOR_NORTE_ID,
    estabelecimentoId: ESTABELECIMENTO_ID,
    unidadeId: NORTE_ID,
    email: 'supervisor.norte@demo.com',
    senhaHash,
    senhaDefinida: true,
    perfil: Perfil.SUPERVISOR_LOCAL,
    nome: 'Camila Supervisora',
    telefone: '(31) 99999-2100',
    ativo: true,
  });
  for (const [indice, item] of ENTREGADORES.entries())
    await usuario({
      id: item.id,
      estabelecimentoId: ESTABELECIMENTO_ID,
      unidadeId: item.unidadeId,
      email: item.email,
      senhaHash,
      senhaDefinida: true,
      perfil: Perfil.ENTREGADOR,
      nome: item.nome,
      telefone: `(31) 98888-300${indice}`,
      documento: item.documento,
      veiculo: item.veiculo,
      rendimentoKmLitro: item.rendimento,
      tipoCombustivel: item.combustivel,
      ativo: true,
    });
  for (const [indice, ponto] of PONTOS.entries())
    await prisma.ponto.upsert({
      where: { id: ponto.id },
      update: ponto,
      create: {
        ...ponto,
        estabelecimentoId: ESTABELECIMENTO_ID,
        unidadeId: indice < 6 ? CENTRO_ID : NORTE_ID,
      },
    });

  // Perfis deliberadamente contrastantes. Os números não são sorteados: cada
  // entregador mantém um padrão reconhecível ao longo dos anos, permitindo que
  // rankings, custos e tempo parado revelem claramente bons e maus desempenhos.
  const perfisOperacionais = [
    {
      entregador: ENTREGADORES[0],
      rotasMes: 4,
      distancia: 54,
      parada: 24,
      custoKm: 0.48,
      receitaKm: 5.2,
    },
    {
      entregador: ENTREGADORES[1],
      rotasMes: 3,
      distancia: 43,
      parada: 39,
      custoKm: 0.61,
      receitaKm: 4.7,
    },
    {
      entregador: ENTREGADORES[2],
      rotasMes: 1,
      distancia: 25,
      parada: 105,
      custoKm: 1.08,
      receitaKm: 3.1,
    },
    {
      entregador: ENTREGADORES[3],
      rotasMes: 2,
      distancia: 34,
      parada: 68,
      custoKm: 0.82,
      receitaKm: 4.0,
    },
    {
      entregador: ENTREGADORES[4],
      rotasMes: 1,
      distancia: 19,
      parada: 148,
      custoKm: 1.42,
      receitaKm: 2.6,
    },
    {
      entregador: ENTREGADORES[5],
      rotasMes: 1,
      distancia: 23,
      parada: 119,
      custoKm: 1.17,
      receitaKm: 2.9,
    },
  ];
  const hoje = new Date();
  const rotas = perfisOperacionais
    .flatMap((perfil, indiceEntregador) =>
      Array.from({ length: 48 }, (_, mesesAtras) =>
        Array.from({ length: perfil.rotasMes }, (_, numeroNoMes) => {
          const data = new Date(
            Date.UTC(
              hoje.getUTCFullYear(),
              hoje.getUTCMonth() - mesesAtras,
              // As equipes operam nos mesmos dias. Isso produz totais diários
              // comparáveis (6, 3, 2 e 1 rota), em vez de uma sequência artificial
              // em que todo dia contém exatamente uma rota.
              2 + numeroNoMes * 6,
            ),
          );
          const variacao =
            ((mesesAtras * 3 + numeroNoMes * 5 + indiceEntregador) % 9) - 4;
          const totalParado = perfil.parada + variacao * 2;
          return {
            data,
            entregador: perfil.entregador,
            tempos: [
              0,
              Math.round(totalParado * 0.28),
              Math.round(totalParado * 0.43),
              Math.round(totalParado * 0.29),
            ],
            distancia: perfil.distancia + variacao * 0.7,
            custoKm: perfil.custoKm,
            receitaKm: perfil.receitaKm,
          };
        }),
      ).flat(),
    )
    .map((rota, indice) => ({
      ...rota,
      id: `50000000-0000-0000-0000-${String(indice + 1).padStart(12, '0')}`,
    }));
  const ROTA_JOAO_HOJE = '50000000-0000-0000-0001-000000000001';
  const ROTA_MARIANA_HOJE = '50000000-0000-0000-0001-000000000002';
  const idsRotasDemo = [
    ...rotas.map((r) => r.id),
    ROTA_JOAO_HOJE,
    ROTA_MARIANA_HOJE,
  ];
  await prisma.auditoria.deleteMany({
    where: { itemRoteiro: { roteiroId: { in: idsRotasDemo } } },
  });
  await prisma.itemRoteiro.deleteMany({
    where: { roteiroId: { in: idsRotasDemo } },
  });
  await prisma.roteiro.deleteMany({ where: { id: { in: idsRotasDemo } } });

  for (const [indiceRota, rota] of rotas.entries()) {
    const data = rota.data;
    const total = rota.tempos.reduce((soma, tempo) => soma + tempo, 0);
    const inicio = comHorario(data, 8, 5 + (indiceRota % 20));
    const duracaoMin = 260 + total + (indiceRota % 50);
    const termino = new Date(inicio.getTime() + duracaoMin * 60_000);
    await prisma.roteiro.create({
      data: {
        id: rota.id,
        estabelecimentoId: ESTABELECIMENTO_ID,
        unidadeId: rota.entregador.unidadeId,
        entregadorId: rota.entregador.id,
        data,
        status: RoteiroStatus.FINALIZADO,
        horaInicio: inicio,
        horaTermino: termino,
        tempoTotalParadoMin: total,
        distanciaTotalKm: rota.distancia,
        custoEstimado: rota.distancia * rota.custoKm,
        receitaBruta: rota.distancia * rota.receitaKm,
        itens: {
          create: rota.tempos.map((tempo, indice) => {
            const chegada = new Date(
              inicio.getTime() + (35 + indice * 67) * 60_000,
            );
            return {
              pontoId:
                PONTOS[
                  (rota.entregador.unidadeId === CENTRO_ID ? 0 : 6) +
                    ((indice + indiceRota) % 6)
                ].id,
              ordem: indice + 1,
              status: ItemRoteiroStatus.CONCLUIDO,
              horaChegada: chegada,
              horaSaida:
                indice === 0
                  ? chegada
                  : new Date(chegada.getTime() + tempo * 60_000),
              tempoParadoMin: indice === 0 ? null : tempo,
            };
          }),
        },
      },
    });
  }

  // Uma rota pronta para João iniciar hoje e outra em andamento para Mariana continuar.
  await prisma.roteiro.create({
    data: {
      id: ROTA_JOAO_HOJE,
      estabelecimentoId: ESTABELECIMENTO_ID,
      unidadeId: CENTRO_ID,
      entregadorId: ENTREGADORES[0].id,
      data: dataDiasAtras(0),
      status: RoteiroStatus.NAO_INICIADO,
      itens: {
        create: [0, 1, 2, 3].map((indice) => ({
          pontoId: PONTOS[indice].id,
          ordem: indice + 1,
        })),
      },
    },
  });
  const inicioHoje = dataDiasAtras(0, 11, 30);
  await prisma.roteiro.create({
    data: {
      id: ROTA_MARIANA_HOJE,
      estabelecimentoId: ESTABELECIMENTO_ID,
      unidadeId: CENTRO_ID,
      entregadorId: ENTREGADORES[1].id,
      data: dataDiasAtras(0),
      status: RoteiroStatus.EM_ANDAMENTO,
      horaInicio: inicioHoje,
      itens: {
        create: [0, 4, 5, 2].map((pontoIndice, indice) => ({
          pontoId: PONTOS[pontoIndice].id,
          ordem: indice + 1,
          status:
            indice === 0
              ? ItemRoteiroStatus.CONCLUIDO
              : ItemRoteiroStatus.PENDENTE,
          horaChegada: indice === 0 ? inicioHoje : null,
          horaSaida: indice === 0 ? inicioHoje : null,
        })),
      },
    },
  });

  // Correções recentes para que a trilha de auditoria já tenha exemplos úteis.
  const itensAuditaveis = await prisma.itemRoteiro.findMany({
    where: {
      roteiroId: { in: rotas.slice(0, 3).map((rota) => rota.id) },
      ordem: 2,
    },
    orderBy: { createdAt: 'asc' },
    take: 3,
  });
  for (const [indice, item] of itensAuditaveis.entries()) {
    const corrigidoEm = dataDiasAtras(indice + 1, 18, 15 + indice * 7);
    await prisma.auditoria.create({
      data: {
        id: `60000000-0000-0000-0000-${String(indice + 1).padStart(12, '0')}`,
        estabelecimentoId: ESTABELECIMENTO_ID,
        autorId: indice % 2 === 0 ? SUPERVISOR_ID : ADMIN_ID,
        itemRoteiroId: item.id,
        dataHoraCorrecao: corrigidoEm,
        entidade: 'ItemRoteiro',
        campo: indice === 1 ? 'horaSaida' : 'horaChegada',
        valorAnterior: dataDiasAtras(indice + 1, 13, 5).toISOString(),
        valorNovo: dataDiasAtras(indice + 1, 13, 12 + indice).toISOString(),
        justificativa: [
          'Horário confirmado no comprovante de entrega.',
          'Ajuste solicitado pelo entregador após falha de conexão.',
          'Registro conciliado com a portaria do cliente.',
        ][indice],
        createdAt: corrigidoEm,
      },
    });
  }

  console.log('\nBase demonstrativa pronta. Use a senha: ' + SENHA_DEMO);
  console.log('  Supervisor geral: admin@demo.com');
  console.log('  Supervisor local: supervisor@demo.com');
  console.log('  Supervisor Norte: supervisor.norte@demo.com');
  console.log('  Entregador com rota pronta: joao@demo.com');
  console.log('  Entregador com rota em andamento: mariana@demo.com');
  console.log(
    `  Dashboard: ${rotas.length} rotas finalizadas em quatro anos e duas unidades\n`,
  );
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
