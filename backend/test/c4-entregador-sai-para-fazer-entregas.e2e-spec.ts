import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  calcularCustoEstimado,
  calcularDistanciaTotalKm,
} from '../src/common/calculos/distancia-custo';
import { Perfil } from '../generated/prisma/client';
import { criarApp } from './support/app';
import { limparBanco, prisma } from './support/db';
import {
  criarEstabelecimentoComSupervisorGeral,
  criarUsuario,
  login,
} from './support/fixtures';

describe('C4 — Entregador sai para fazer entregas (e2e)', () => {
  let app: INestApplication;
  let estabelecimentoId: string;
  let unidadeId: string;
  let tokenSupervisorLocal: string;
  let tokenEntregador: string;
  let entregadorId: string;
  let rendimentoKmLitro: number;
  let valorCombustivel: number;
  const pontos = [
    { endereco: 'Ponto A (partida)', latitude: -19.9, longitude: -43.9 },
    { endereco: 'Ponto B', latitude: -19.91, longitude: -43.91 },
    { endereco: 'Ponto C', latitude: -19.92, longitude: -43.92 },
  ];
  let pontoIds: string[];

  async function localizacao(
    indice: number,
    tipo: 'INICIAR_ROTEIRO' | 'REGISTRAR_CHEGADA' | 'REGISTRAR_SAIDA',
    alvoId: string,
    usuarioId = entregadorId,
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
      latitude: pontos[indice].latitude,
      longitude: pontos[indice].longitude,
      precisaoMetros: 5,
      capturadaEm: new Date().toISOString(),
    };
  }

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

    rendimentoKmLitro = 12;
    const entregador = await criarUsuario({
      estabelecimentoId,
      unidadeId,
      perfil: Perfil.ENTREGADOR,
    });
    entregadorId = entregador.id;
    await prisma.usuario.update({
      where: { id: entregador.id },
      data: { rendimentoKmLitro },
    });
    tokenEntregador = await login(app, entregador.email);

    valorCombustivel = 6.0;
    await prisma.parametro.create({
      data: {
        unidadeId,
        valorCombustivel,
        custoPorKm: 0.8,
        jornadaPadraoHoras: 8,
      },
    });

    pontoIds = [];
    for (const ponto of pontos) {
      const criado = await prisma.ponto.create({
        data: { estabelecimentoId, unidadeId, ...ponto },
      });
      pontoIds.push(criado.id);
    }

    const roteiro = await request(app.getHttpServer())
      .post('/roteiros')
      .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
      .send({ entregadorId: entregador.id, data: '2026-02-01', pontoIds })
      .expect(201);
    roteiroId = roteiro.body.id;
    itemIds = roteiro.body.itens.map((item: { id: string }) => item.id);
  });

  let roteiroId: string;
  let itemIds: string[];

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('UC11 — inicia o roteiro, marca o ponto de partida sem tempo parado (RN01)', async () => {
    const resposta = await request(app.getHttpServer())
      .post(`/roteiros/${roteiroId}/iniciar`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send(await localizacao(0, 'INICIAR_ROTEIRO', roteiroId))
      .expect(201);

    expect(resposta.body.status).toBe('EM_ANDAMENTO');
    expect(resposta.body.horaInicio).not.toBeNull();
    expect(resposta.body.itens[0]).toMatchObject({
      status: 'CONCLUIDO',
      tempoParadoMin: null,
    });
    expect(resposta.body.itens[0].horaChegada).toBe(
      resposta.body.itens[0].horaSaida,
    );
    expect(Number(resposta.body.itens[0].chegadaLatitude)).toBe(
      pontos[0].latitude,
    );
  });

  it('UC11, 3a — iniciar de novo não duplica, mantém "em andamento"', async () => {
    const resposta = await request(app.getHttpServer())
      .post(`/roteiros/${roteiroId}/iniciar`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send(await localizacao(0, 'INICIAR_ROTEIRO', roteiroId))
      .expect(201);

    expect(resposta.body.status).toBe('EM_ANDAMENTO');
  });

  it('antifraude — exige localização em toda chegada', async () => {
    await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[1]}/chegada`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send({})
      .expect(400);
  });

  it('antifraude — rejeita salto entre pontos em velocidade impossível', async () => {
    await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[1]}/chegada`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send(await localizacao(1, 'REGISTRAR_CHEGADA', itemIds[1]))
      .expect(400);
  });

  it('antifraude — desafio é curto e vinculado ao usuário, ação e alvo', async () => {
    await prisma.itemRoteiro.update({
      where: { id: itemIds[0] },
      data: { horaSaida: new Date(Date.now() - 60_000) },
    });
    const resposta = await request(app.getHttpServer())
      .post('/roteiros/desafios-localizacao')
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send({ tipo: 'REGISTRAR_CHEGADA', alvoId: itemIds[2] })
      .expect(201);

    expect(resposta.body.id).toEqual(expect.any(String));
    expect(new Date(resposta.body.expiraEm).getTime()).toBeGreaterThan(
      Date.now(),
    );

    await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[1]}/chegada`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send({
        desafioId: resposta.body.id,
        latitude: pontos[1].latitude,
        longitude: pontos[1].longitude,
        precisaoMetros: 5,
        capturadaEm: new Date().toISOString(),
      })
      .expect(400);
  });

  it('antifraude — rejeita localização antiga, imprecisa ou fora do ponto', async () => {
    const autorizada = await localizacao(1, 'REGISTRAR_CHEGADA', itemIds[1]);
    await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[1]}/chegada`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send({
        ...autorizada,
        capturadaEm: new Date(Date.now() - 31_000).toISOString(),
      })
      .expect(400);

    await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[1]}/chegada`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send({ ...autorizada, precisaoMetros: 51 })
      .expect(400);

    await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[1]}/chegada`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send({
        ...autorizada,
        latitude: pontos[0].latitude,
        longitude: pontos[0].longitude,
      })
      .expect(400);
  });

  it('UC12, 3a — bloqueia chegada fora de ordem', async () => {
    await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[2]}/chegada`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send(await localizacao(2, 'REGISTRAR_CHEGADA', itemIds[2]))
      .expect(400);
  });

  it('UC12 — registra a chegada no próximo ponto pendente', async () => {
    const medicao = await localizacao(1, 'REGISTRAR_CHEGADA', itemIds[1]);
    const resposta = await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[1]}/chegada`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send(medicao)
      .expect(201);

    const item = resposta.body.itens.find(
      (i: { id: string }) => i.id === itemIds[1],
    );
    expect(item.status).toBe('AGUARDANDO_SAIDA');
    expect(item.horaChegada).not.toBeNull();
    expect(Number(item.chegadaLatitude)).toBe(pontos[1].latitude);
    expect(Number(item.chegadaPrecisaoMetros)).toBe(5);
    const desafioConsumido = await prisma.desafioLocalizacao.findUniqueOrThrow({
      where: { id: medicao.desafioId },
    });
    expect(desafioConsumido.consumidoEm).not.toBeNull();
  });

  it('UC12, 4a — bloqueia registrar chegada duplicada', async () => {
    await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[1]}/chegada`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send(await localizacao(1, 'REGISTRAR_CHEGADA', itemIds[1]))
      .expect(409);
  });

  it('UC13, 2b — bloqueia saída sem chegada registrada', async () => {
    await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[2]}/saida`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send(await localizacao(2, 'REGISTRAR_SAIDA', itemIds[2]))
      .expect(400);
  });

  it('UC13 — registra a saída e calcula o tempo parado do ponto (RN02, via UC15)', async () => {
    const resposta = await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[1]}/saida`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send(await localizacao(1, 'REGISTRAR_SAIDA', itemIds[1]))
      .expect(201);

    const item = resposta.body.itens.find(
      (i: { id: string }) => i.id === itemIds[1],
    );
    expect(item.status).toBe('CONCLUIDO');
    expect(item.tempoParadoMin).toBeGreaterThanOrEqual(0);
    expect(Number(item.saidaLongitude)).toBe(pontos[1].longitude);
    expect(resposta.body.status).toBe('EM_ANDAMENTO');
  });

  it('UC13, 2a — bloqueia registrar saída duplicada', async () => {
    await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[1]}/saida`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send(await localizacao(1, 'REGISTRAR_SAIDA', itemIds[1]))
      .expect(409);
  });

  it('UC14 — saída do último ponto finaliza automaticamente com tempo total, distância e custo', async () => {
    await prisma.itemRoteiro.update({
      where: { id: itemIds[1] },
      data: { horaSaida: new Date(Date.now() - 60_000) },
    });
    await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[2]}/chegada`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send(await localizacao(2, 'REGISTRAR_CHEGADA', itemIds[2]))
      .expect(201);

    const resposta = await request(app.getHttpServer())
      .post(`/roteiros/itens/${itemIds[2]}/saida`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .send(await localizacao(2, 'REGISTRAR_SAIDA', itemIds[2]))
      .expect(201);

    expect(resposta.body.status).toBe('FINALIZADO');
    expect(resposta.body.horaTermino).not.toBeNull();

    const itemB = resposta.body.itens.find(
      (i: { id: string }) => i.id === itemIds[1],
    );
    const itemC = resposta.body.itens.find(
      (i: { id: string }) => i.id === itemIds[2],
    );
    expect(resposta.body.tempoTotalParadoMin).toBe(
      itemB.tempoParadoMin + itemC.tempoParadoMin,
    );

    const distanciaEsperada = calcularDistanciaTotalKm(
      pontos.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
    );
    expect(Number(resposta.body.distanciaTotalKm)).toBeCloseTo(
      distanciaEsperada,
      3,
    );

    const custoEsperado = calcularCustoEstimado(
      distanciaEsperada,
      rendimentoKmLitro,
      valorCombustivel,
    );
    expect(Number(resposta.body.custoEstimado)).toBeCloseTo(custoEsperado, 2);
  });

  it('UC14, 5a — finalizar de novo retorna o resumo já calculado, sem reprocessar', async () => {
    const resposta = await request(app.getHttpServer())
      .post(`/roteiros/${roteiroId}/finalizar`)
      .set('Authorization', `Bearer ${tokenEntregador}`)
      .expect(201);

    expect(resposta.body.status).toBe('FINALIZADO');
  });

  it('UC14, 1a (ADR-011) — bloqueia finalizar com pontos pendentes', async () => {
    const outroEntregador = await criarUsuario({
      estabelecimentoId,
      unidadeId,
      perfil: Perfil.ENTREGADOR,
    });
    await prisma.usuario.update({
      where: { id: outroEntregador.id },
      data: { rendimentoKmLitro },
    });
    const tokenOutro = await login(app, outroEntregador.email);

    const outroRoteiro = await request(app.getHttpServer())
      .post('/roteiros')
      .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
      .send({ entregadorId: outroEntregador.id, data: '2026-02-02', pontoIds })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/roteiros/${outroRoteiro.body.id}/iniciar`)
      .set('Authorization', `Bearer ${tokenOutro}`)
      .send(
        await localizacao(
          0,
          'INICIAR_ROTEIRO',
          outroRoteiro.body.id,
          outroEntregador.id,
        ),
      )
      .expect(201);

    await request(app.getHttpServer())
      .post(`/roteiros/${outroRoteiro.body.id}/finalizar`)
      .set('Authorization', `Bearer ${tokenOutro}`)
      .expect(400);
  });
});
