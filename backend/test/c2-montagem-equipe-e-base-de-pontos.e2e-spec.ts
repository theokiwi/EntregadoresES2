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

describe('C2 — Montagem da equipe e da base de pontos (e2e)', () => {
  let app: INestApplication;
  let estabelecimentoId: string;
  let unidadeId: string;
  let tokenSupervisorLocal: string;
  let tokenSupervisorGeral: string;

  beforeAll(async () => {
    await limparBanco();
    app = await criarApp();
    const fixture = await criarEstabelecimentoComSupervisorGeral();
    estabelecimentoId = fixture.estabelecimento.id;
    unidadeId = fixture.unidade.id;
    tokenSupervisorGeral = await login(app, fixture.supervisorGeral.email);

    const supervisorLocal = await criarUsuario({
      estabelecimentoId,
      unidadeId,
      perfil: Perfil.SUPERVISOR_LOCAL,
    });
    tokenSupervisorLocal = await login(app, supervisorLocal.email);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('UC06 — Cadastrar entregador', () => {
    it('cria o entregador associado à Unidade do Supervisor local autenticado', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/entregadores')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({
          nome: 'João',
          telefone: '(31) 91234-5678',
          documento: '111.111.111-11',
          veiculo: 'Moto Honda CG',
          rendimentoKmLitro: 30,
        })
        .expect(201);

      expect(resposta.body.perfil).toBe(Perfil.ENTREGADOR);
      expect(resposta.body.unidadeId).toBe(unidadeId);
      expect(resposta.body.senhaHash).toBeUndefined();
    });

    it('bloqueia CPF já cadastrado no mesmo Estabelecimento', async () => {
      await request(app.getHttpServer())
        .post('/entregadores')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({
          nome: 'João Duplicado',
          telefone: '(31) 91234-5678',
          documento: '11111111111',
          veiculo: 'Moto Honda CG',
          rendimentoKmLitro: 30,
        })
        .expect(409);
    });

    it('bloqueia rendimento km/litro igual a zero', async () => {
      await request(app.getHttpServer())
        .post('/entregadores')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({
          nome: 'Maria',
          telefone: '(31) 98888-7777',
          documento: '222.222.222-22',
          veiculo: 'Moto Yamaha',
          rendimentoKmLitro: 0,
        })
        .expect(400);
    });

    it('Supervisor geral precisa informar a Unidade explicitamente', async () => {
      await request(app.getHttpServer())
        .post('/entregadores')
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .send({
          nome: 'Pedro',
          telefone: '(31) 97777-6666',
          documento: '333.333.333-33',
          veiculo: 'Moto Honda Biz',
          rendimentoKmLitro: 25,
        })
        .expect(400);

      const resposta = await request(app.getHttpServer())
        .post('/entregadores')
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .send({
          nome: 'Pedro',
          telefone: '(31) 97777-6666',
          documento: '333.333.333-33',
          veiculo: 'Moto Honda Biz',
          rendimentoKmLitro: 25,
          unidadeId,
        })
        .expect(201);

      expect(resposta.body.unidadeId).toBe(unidadeId);
    });
  });

  describe('UC07 — Cadastrar ponto', () => {
    it('cria o ponto associado à Unidade do Supervisor local autenticado', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/pontos')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({
          endereco: 'Rua Peru, 55',
          latitude: -19.921,
          longitude: -43.937,
        })
        .expect(201);

      expect(resposta.body.unidadeId).toBe(unidadeId);
    });

    it('bloqueia cadastro sem coordenadas', async () => {
      await request(app.getHttpServer())
        .post('/pontos')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({ endereco: 'Rua sem coordenadas, 10' })
        .expect(400);
    });

    it('bloqueia latitude fora da faixa válida', async () => {
      await request(app.getHttpServer())
        .post('/pontos')
        .set('Authorization', `Bearer ${tokenSupervisorLocal}`)
        .send({
          endereco: 'Rua inválida, 20',
          latitude: 200,
          longitude: -43.937,
        })
        .expect(400);
    });
  });
});
