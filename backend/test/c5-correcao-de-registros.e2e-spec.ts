import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Perfil } from '../generated/prisma/client';
import { criarApp } from './support/app';
import { limparBanco, prisma } from './support/db';
import {
  criarEstabelecimentoComSupervisorGeral,
  criarUsuario,
  login,
} from './support/fixtures';

async function localizacaoAutorizada(
  usuarioId: string,
  tipo: 'INICIAR_ROTEIRO' | 'REGISTRAR_CHEGADA' | 'REGISTRAR_SAIDA',
  alvoId: string,
  latitude: number,
  longitude: number,
) {
  const desafio = await prisma.desafioLocalizacao.create({
    data: {
      usuarioId,
      tipo,
      alvoId,
      expiraEm: new Date(Date.now() + 60_000),
    },
  });
  return {
    desafioId: desafio.id,
    latitude,
    longitude,
    precisaoMetros: 5,
    capturadaEm: new Date().toISOString(),
  };
}

async function montarERodarRoteiroCompleto(
  app: INestApplication,
  params: {
    tokenSupervisorLocal: string;
    tokenEntregador: string;
    entregadorId: string;
    pontoIds: string[];
    data: string;
  },
) {
  const roteiro = await request(app.getHttpServer())
    .post('/roteiros')
    .set('Authorization', `Bearer ${params.tokenSupervisorLocal}`)
    .send({
      entregadorId: params.entregadorId,
      data: params.data,
      pontoIds: params.pontoIds,
    })
    .expect(201);

  await request(app.getHttpServer())
    .post(`/roteiros/${roteiro.body.id}/iniciar`)
    .set('Authorization', `Bearer ${params.tokenEntregador}`)
    .send(
      await localizacaoAutorizada(
        params.entregadorId,
        'INICIAR_ROTEIRO',
        roteiro.body.id,
        -19.9,
        -43.9,
      ),
    )
    .expect(201);

  await prisma.itemRoteiro.update({
    where: { id: roteiro.body.itens[0].id },
    data: { horaSaida: new Date(Date.now() - 60_000) },
  });

  const itemB = roteiro.body.itens[1].id;
  await request(app.getHttpServer())
    .post(`/roteiros/itens/${itemB}/chegada`)
    .set('Authorization', `Bearer ${params.tokenEntregador}`)
    .send(
      await localizacaoAutorizada(
        params.entregadorId,
        'REGISTRAR_CHEGADA',
        itemB,
        -19.91,
        -43.91,
      ),
    )
    .expect(201);
  const finalRes = await request(app.getHttpServer())
    .post(`/roteiros/itens/${itemB}/saida`)
    .set('Authorization', `Bearer ${params.tokenEntregador}`)
    .send(
      await localizacaoAutorizada(
        params.entregadorId,
        'REGISTRAR_SAIDA',
        itemB,
        -19.91,
        -43.91,
      ),
    )
    .expect(201);

  return {
    roteiroId: roteiro.body.id,
    itemPartidaId: roteiro.body.itens[0].id,
    itemBId: itemB,
    final: finalRes.body,
  };
}

describe('C5 — Correção de registros (e2e)', () => {
  let app: INestApplication;
  let estabelecimentoId: string;
  let unidadeId: string;
  let tokenSupervisorLocal: string;
  let tokenEntregador: string;
  let entregadorId: string;
  let pontoIds: string[];

  beforeAll(async () => {
    await limparBanco();
    app = await criarApp();
    const fixture = await criarEstabelecimentoComSupervisorGeral();
    estabelecimentoId = fixture.estabelecimento.id;
    unidadeId = fixture.unidade.id;

    const supervisorLocal = await criarUsuario({
      estabelecimentoId,
      unidadeId,
      perfil: Perfil.SUPERVISOR_LOCAL,
    });
    tokenSupervisorLocal = await login(app, supervisorLocal.email);

    const entregador = await criarUsuario({
      estabelecimentoId,
      unidadeId,
      perfil: Perfil.ENTREGADOR,
    });
    entregadorId = entregador.id;
    await prisma.usuario.update({
      where: { id: entregador.id },
      data: { rendimentoKmLitro: 10 },
    });
    tokenEntregador = await login(app, entregador.email);

    await prisma.parametro.create({
      data: {
        unidadeId,
        valorCombustivel: 5,
        custoPorKm: 0.5,
        jornadaPadraoHoras: 8,
      },
    });

    const pontoA = await prisma.ponto.create({
      data: {
        estabelecimentoId,
        unidadeId,
        endereco: 'Partida',
        latitude: -19.9,
        longitude: -43.9,
      },
    });
    const pontoB = await prisma.ponto.create({
      data: {
        estabelecimentoId,
        unidadeId,
        endereco: 'Ponto B',
        latitude: -19.91,
        longitude: -43.91,
      },
    });
    pontoIds = [pontoA.id, pontoB.id];
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('UC16 — Corrigir horário (roteiro em andamento, não finalizado)', () => {
    let itemBId: string;

    beforeAll(async () => {
      const roteiro = await request(app.getHttpServer())
        .post('/roteiros')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({ entregadorId, data: '2026-03-01', pontoIds })
        .expect(201);
      await request(app.getHttpServer())
        .post(`/roteiros/${roteiro.body.id}/iniciar`)
        .set('Authorization', `Bearer ${tokenEntregador}`)
        .send(
          await localizacaoAutorizada(
            entregadorId,
            'INICIAR_ROTEIRO',
            roteiro.body.id,
            -19.9,
            -43.9,
          ),
        )
        .expect(201);
      await prisma.itemRoteiro.update({
        where: { id: roteiro.body.itens[0].id },
        data: { horaSaida: new Date(Date.now() - 60_000) },
      });
      itemBId = roteiro.body.itens[1].id;
      await request(app.getHttpServer())
        .post(`/roteiros/itens/${itemBId}/chegada`)
        .set('Authorization', `Bearer ${tokenEntregador}`)
        .send(
          await localizacaoAutorizada(
            entregadorId,
            'REGISTRAR_CHEGADA',
            itemBId,
            -19.91,
            -43.91,
          ),
        )
        .expect(201);
      // Não registra saída aqui — mantém o roteiro "Em andamento" para este bloco de testes.
    });

    it('3a — bloqueia correção sem justificativa', async () => {
      await request(app.getHttpServer())
        .patch(`/correcoes/itens/${itemBId}`)
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({ campo: 'horaChegada', novoValor: new Date().toISOString() })
        .expect(400);
    });

    it('corrige horaChegada e cria registro de auditoria', async () => {
      const novaChegada = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const resposta = await request(app.getHttpServer())
        .patch(`/correcoes/itens/${itemBId}`)
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({
          campo: 'horaChegada',
          novoValor: novaChegada,
          justificativa: 'falha de GPS no registro original',
        })
        .expect(200);

      const item = resposta.body.itens.find(
        (i: { id: string }) => i.id === itemBId,
      );
      expect(new Date(item.horaChegada).toISOString()).toBe(novaChegada);

      const auditorias = await prisma.auditoria.findMany({
        where: { itemRoteiroId: itemBId },
      });
      expect(auditorias).toHaveLength(1);
      expect(auditorias[0]).toMatchObject({
        campo: 'horaChegada',
        justificativa: 'falha de GPS no registro original',
      });
    });

    it('4a — bloqueia correção que tornaria a saída anterior/igual à chegada', async () => {
      // Registra a saída para então tentar uma correção inválida.
      await request(app.getHttpServer())
        .post(`/roteiros/itens/${itemBId}/saida`)
        .set('Authorization', `Bearer ${tokenEntregador}`)
        .send(
          await localizacaoAutorizada(
            entregadorId,
            'REGISTRAR_SAIDA',
            itemBId,
            -19.91,
            -43.91,
          ),
        )
        .expect(201);

      const itemAtual = await prisma.itemRoteiro.findUniqueOrThrow({
        where: { id: itemBId },
      });

      await request(app.getHttpServer())
        .patch(`/correcoes/itens/${itemBId}`)
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({
          campo: 'horaSaida',
          novoValor: itemAtual.horaChegada!.toISOString(),
          justificativa: 'tentativa inválida',
        })
        .expect(400);
    });

    it('Supervisor local de outro Estabelecimento não encontra o ponto', async () => {
      const outroEstabelecimento =
        await criarEstabelecimentoComSupervisorGeral();
      const outroSupervisor = await criarUsuario({
        estabelecimentoId: outroEstabelecimento.estabelecimento.id,
        unidadeId: outroEstabelecimento.unidade.id,
        perfil: Perfil.SUPERVISOR_LOCAL,
      });
      const tokenOutro = await login(app, outroSupervisor.email);

      await request(app.getHttpServer())
        .patch(`/correcoes/itens/${itemBId}`)
        .set('Authorization', `Bearer ${tokenOutro}`)
        .send({
          campo: 'horaChegada',
          novoValor: new Date().toISOString(),
          justificativa: 'x',
        })
        .expect(404); // fora do Estabelecimento do supervisor — nem encontrado (RepositorioRoteiro já filtra).
    });

    it('Supervisor local de outra Unidade do mesmo Estabelecimento é bloqueado (403)', async () => {
      const outraUnidade = await prisma.unidade.create({
        data: {
          estabelecimentoId,
          nome: 'Filial Norte C5',
          endereco: 'Rua X',
          fusoHorario: 'America/Sao_Paulo',
        },
      });
      const supervisorOutraUnidade = await criarUsuario({
        estabelecimentoId,
        unidadeId: outraUnidade.id,
        perfil: Perfil.SUPERVISOR_LOCAL,
      });
      const tokenOutraUnidade = await login(app, supervisorOutraUnidade.email);

      await request(app.getHttpServer())
        .patch(`/correcoes/itens/${itemBId}`)
        .set('Authorization', `Bearer ${tokenOutraUnidade}`)
        .send({
          campo: 'horaChegada',
          novoValor: new Date().toISOString(),
          justificativa: 'x',
        })
        .expect(403);
    });
  });

  describe('UC16 — Corrigir horário recalcula o total quando o Roteiro está Finalizado (ADR-013)', () => {
    it('recalcula tempoTotalParadoMin mantendo o Roteiro Finalizado e sem tocar distância/custo', async () => {
      const { roteiroId, itemBId, final } = await montarERodarRoteiroCompleto(
        app,
        {
          tokenSupervisorLocal,
          tokenEntregador,
          entregadorId,
          pontoIds,
          data: '2026-03-02',
        },
      );

      expect(final.status).toBe('FINALIZADO');
      const distanciaOriginal = final.distanciaTotalKm;
      const custoOriginal = final.custoEstimado;
      const itemBOriginal = final.itens.find(
        (i: { id: string }) => i.id === itemBId,
      );

      const novaSaida = new Date(
        new Date(itemBOriginal.horaChegada).getTime() + 45 * 60 * 1000,
      ).toISOString();
      const resposta = await request(app.getHttpServer())
        .patch(`/correcoes/itens/${itemBId}`)
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({
          campo: 'horaSaida',
          novoValor: novaSaida,
          justificativa: 'ajuste de horário confirmado com o cliente',
        })
        .expect(200);

      expect(resposta.body.status).toBe('FINALIZADO');
      expect(resposta.body.id).toBe(roteiroId);
      const itemBCorrigido = resposta.body.itens.find(
        (i: { id: string }) => i.id === itemBId,
      );
      expect(itemBCorrigido.tempoParadoMin).toBe(45);
      expect(resposta.body.tempoTotalParadoMin).toBe(45);
      expect(resposta.body.distanciaTotalKm).toBe(distanciaOriginal);
      expect(resposta.body.custoEstimado).toBe(custoOriginal);
    });

    it('4b/RN01 — corrigir o ponto de partida nunca gera tempoParado', async () => {
      const { itemPartidaId, roteiroId } = await montarERodarRoteiroCompleto(
        app,
        {
          tokenSupervisorLocal,
          tokenEntregador,
          entregadorId,
          pontoIds,
          data: '2026-03-03',
        },
      );

      const partidaOriginal = await prisma.itemRoteiro.findUniqueOrThrow({
        where: { id: itemPartidaId },
      });
      const novaSaida = new Date(
        partidaOriginal.horaSaida!.getTime() + 10 * 60 * 1000,
      ).toISOString();

      const resposta = await request(app.getHttpServer())
        .patch(`/correcoes/itens/${itemPartidaId}`)
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({
          campo: 'horaSaida',
          novoValor: novaSaida,
          justificativa: 'apenas registro, sem efeito no tempo parado',
        })
        .expect(200);

      const partidaCorrigida = resposta.body.itens.find(
        (i: { id: string }) => i.id === itemPartidaId,
      );
      expect(partidaCorrigida.tempoParadoMin).toBeNull();
      expect(resposta.body.id).toBe(roteiroId);
    });
  });

  describe('UC17 — Consultar trilha de auditoria', () => {
    it('lista as correções da Unidade, mais recente primeiro, dentro do período padrão de 30 dias', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/auditoria')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .expect(200);

      expect(resposta.body.length).toBeGreaterThan(0);
      const datas = resposta.body.map((a: { dataHoraCorrecao: string }) =>
        new Date(a.dataHoraCorrecao).getTime(),
      );
      expect(datas).toEqual([...datas].sort((a, b) => b - a));
      for (const registro of resposta.body) {
        expect(registro.itemRoteiro.roteiro.unidadeId).toBe(unidadeId);
      }
    });

    it('3a — Unidade sem correções retorna lista vazia', async () => {
      const outraUnidade = await criarEstabelecimentoComSupervisorGeral();
      const outroSupervisor = await criarUsuario({
        estabelecimentoId: outraUnidade.estabelecimento.id,
        unidadeId: outraUnidade.unidade.id,
        perfil: Perfil.SUPERVISOR_LOCAL,
      });
      const tokenOutro = await login(app, outroSupervisor.email);

      const resposta = await request(app.getHttpServer())
        .get('/auditoria')
        .set('Authorization', `Bearer ${tokenOutro}`)
        .expect(200);

      expect(resposta.body).toEqual([]);
    });
  });
});
