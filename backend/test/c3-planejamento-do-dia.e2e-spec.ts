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

describe('C3 — Planejamento do dia (e2e)', () => {
  let app: INestApplication;
  let estabelecimentoId: string;
  let unidadeId: string;
  let tokenSupervisorLocal: string;
  let entregadorId: string;
  let tokenEntregador: string;
  let pontoAId: string;
  let pontoBId: string;

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
    tokenEntregador = await login(app, entregador.email);

    const pontoA = await prisma.ponto.create({
      data: {
        estabelecimentoId,
        unidadeId,
        endereco: 'Rua Peru, 55',
        latitude: -19.921,
        longitude: -43.937,
      },
    });
    pontoAId = pontoA.id;
    const pontoB = await prisma.ponto.create({
      data: {
        estabelecimentoId,
        unidadeId,
        endereco: 'Av. Central, 100',
        latitude: -19.9,
        longitude: -43.9,
      },
    });
    pontoBId = pontoB.id;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('UC08 — Registrar pedidos/endereços de entrega', () => {
    it('reaproveita um Ponto existente com o mesmo endereço', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/pedidos')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({ endereco: 'Rua Peru, 55' })
        .expect(201);

      expect(resposta.body.reaproveitado).toBe(true);
      expect(resposta.body.ponto.id).toBe(pontoAId);
    });

    it('inclui UC07 e cria um novo Ponto quando o endereço não existe', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/pedidos')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({
          endereco: 'Av. Nova, 200',
          latitude: -19.95,
          longitude: -43.95,
        })
        .expect(201);

      expect(resposta.body.reaproveitado).toBe(false);
      expect(resposta.body.ponto.endereco).toBe('Av. Nova, 200');
    });

    it('bloqueia endereço sem número', async () => {
      await request(app.getHttpServer())
        .post('/pedidos')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({ endereco: 'Rua sem número' })
        .expect(400);
    });

    it('bloqueia endereço novo sem coordenadas', async () => {
      await request(app.getHttpServer())
        .post('/pedidos')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({ endereco: 'Rua Desconhecida, 999' })
        .expect(400);
    });
  });

  describe('UC09 — Montar roteiro diário', () => {
    it('cria o roteiro com os pontos na ordem sequencial informada', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/roteiros')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({
          entregadorId,
          data: '2026-01-15',
          pontoIds: [pontoAId, pontoBId],
        })
        .expect(201);

      expect(resposta.body.status).toBe('NAO_INICIADO');
      expect(resposta.body.itens).toHaveLength(2);
      expect(resposta.body.itens[0]).toMatchObject({
        ordem: 1,
        pontoId: pontoAId,
      });
      expect(resposta.body.itens[1]).toMatchObject({
        ordem: 2,
        pontoId: pontoBId,
      });
    });

    it('bloqueia criar outro roteiro para o mesmo Entregador na mesma data (RN05)', async () => {
      await request(app.getHttpServer())
        .post('/roteiros')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({ entregadorId, data: '2026-01-15', pontoIds: [pontoAId] })
        .expect(409);
    });

    it('bloqueia salvar roteiro sem nenhum ponto selecionado', async () => {
      await request(app.getHttpServer())
        .post('/roteiros')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({ entregadorId, data: '2026-01-16', pontoIds: [] })
        .expect(400);
    });
  });

  describe('UC10 — Consultar roteiro do dia', () => {
    it('exibe "nenhum roteiro" quando não há roteiro para hoje', async () => {
      const resposta = await request(app.getHttpServer())
        .get('/roteiros/hoje')
        .set('Authorization', `Bearer ${tokenEntregador}`)
        .expect(200);

      expect(resposta.body.roteiro).toBeNull();
    });

    it('exibe os pontos do roteiro de hoje em ordem sequencial', async () => {
      const hoje = new Date().toISOString().slice(0, 10);
      await request(app.getHttpServer())
        .post('/roteiros')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({ entregadorId, data: hoje, pontoIds: [pontoBId, pontoAId] })
        .expect(201);

      const resposta = await request(app.getHttpServer())
        .get('/roteiros/hoje')
        .set('Authorization', `Bearer ${tokenEntregador}`)
        .expect(200);

      expect(resposta.body.roteiro.itens).toHaveLength(2);
      expect(resposta.body.roteiro.itens[0]).toMatchObject({
        ordem: 1,
        pontoId: pontoBId,
      });
    });

    it('bloqueia Entregador de consultar o roteiro de outro Entregador por id', async () => {
      const outroEntregador = await criarUsuario({
        estabelecimentoId,
        unidadeId,
        perfil: Perfil.ENTREGADOR,
      });
      const tokenOutro = await login(app, outroEntregador.email);

      const roteiroDoEntregador = await request(app.getHttpServer())
        .get('/roteiros/hoje')
        .set('Authorization', `Bearer ${tokenEntregador}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/roteiros/${roteiroDoEntregador.body.roteiro.id}`)
        .set('Authorization', `Bearer ${tokenOutro}`)
        .expect(403);
    });
  });
});
