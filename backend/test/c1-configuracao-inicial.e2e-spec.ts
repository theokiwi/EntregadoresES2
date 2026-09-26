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

describe('C1 — Configuração inicial (e2e)', () => {
  let app: INestApplication;
  let estabelecimentoId: string;
  let unidadeId: string;
  let tokenSupervisorGeral: string;

  beforeAll(async () => {
    await limparBanco();
    app = await criarApp();
    const fixture = await criarEstabelecimentoComSupervisorGeral();
    estabelecimentoId = fixture.estabelecimento.id;
    unidadeId = fixture.unidade.id;
    tokenSupervisorGeral = await login(app, fixture.supervisorGeral.email);
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('UC01 — Cadastrar unidade', () => {
    it('cria a unidade vinculada ao Estabelecimento do Supervisor geral autenticado', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/unidades')
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .send({
          nome: 'Filial Centro',
          endereco: 'Av. Principal, 1000',
          fusoHorario: 'America/Sao_Paulo',
        })
        .expect(201);

      expect(resposta.body.estabelecimentoId).toBe(estabelecimentoId);
    });

    it('rejeita requisição sem token (RNF04)', async () => {
      await request(app.getHttpServer()).get('/unidades').expect(401);
    });

    it('bloqueia nome de unidade duplicado no mesmo Estabelecimento', async () => {
      await request(app.getHttpServer())
        .post('/unidades')
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .send({
          nome: 'Filial Centro',
          endereco: 'Outro endereço',
          fusoHorario: 'America/Sao_Paulo',
        })
        .expect(409);
    });

    it('só permite Supervisor geral executar o cadastro', async () => {
      const entregador = await criarUsuario({
        estabelecimentoId,
        unidadeId,
        perfil: Perfil.ENTREGADOR,
      });
      const tokenEntregador = await login(app, entregador.email);

      await request(app.getHttpServer())
        .post('/unidades')
        .set('Authorization', `Bearer ${tokenEntregador}`)
        .send({
          nome: 'Filial Não Autorizada',
          endereco: 'X',
          fusoHorario: 'America/Sao_Paulo',
        })
        .expect(403);
    });
  });

  describe('UC03 — Parametrizar custos', () => {
    it('grava valorCombustivel e custoPorKm quando ambos são positivos', async () => {
      const resposta = await request(app.getHttpServer())
        .put(`/unidades/${unidadeId}/parametros/custos`)
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .send({ valorCombustivel: 6.0, custoPorKm: 0.8 })
        .expect(200);

      expect(Number(resposta.body.valorCombustivel)).toBeCloseTo(6.0);
      expect(Number(resposta.body.custoPorKm)).toBeCloseTo(0.8);
    });

    it('bloqueia valor de combustível negativo', async () => {
      await request(app.getHttpServer())
        .put(`/unidades/${unidadeId}/parametros/custos`)
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .send({ valorCombustivel: -1, custoPorKm: 0.8 })
        .expect(400);
    });
  });

  describe('UC04 — Parametrizar jornada e regras de tempo parado', () => {
    it('retorna a jornada default de 8h para uma Unidade sem parametrização prévia', async () => {
      const unidadeNova = await prisma.unidade.create({
        data: {
          estabelecimentoId,
          nome: `Filial sem parametrização ${Date.now()}`,
          endereco: 'Rua de Teste, 2',
          fusoHorario: 'America/Sao_Paulo',
        },
      });

      const resposta = await request(app.getHttpServer())
        .get(`/unidades/${unidadeNova.id}/parametros`)
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .expect(200);

      expect(resposta.body.jornadaPadraoHoras).toBe(8);
    });

    it('atualiza a jornada padrão dentro do intervalo válido', async () => {
      const resposta = await request(app.getHttpServer())
        .put(`/unidades/${unidadeId}/parametros/jornada`)
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .send({ jornadaPadraoHoras: 6 })
        .expect(200);

      expect(resposta.body.jornadaPadraoHoras).toBe(6);
    });

    it('bloqueia jornada fora do intervalo 1–24', async () => {
      await request(app.getHttpServer())
        .put(`/unidades/${unidadeId}/parametros/jornada`)
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .send({ jornadaPadraoHoras: 30 })
        .expect(400);
    });
  });

  describe('UC02 — Cadastrar supervisor local', () => {
    it('cria o usuário com perfil Supervisor local e status "convite pendente" (senhaDefinida=false)', async () => {
      const resposta = await request(app.getHttpServer())
        .post('/supervisores')
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .send({ nome: 'João', email: 'joao@empresa.com', unidadeId })
        .expect(201);

      expect(resposta.body.perfil).toBe(Perfil.SUPERVISOR_LOCAL);
      expect(resposta.body.senhaDefinida).toBe(false);
      expect(resposta.body.senhaHash).toBeUndefined();

      const usuarioNoBanco = await prisma.usuario.findUnique({
        where: { email: 'joao@empresa.com' },
      });
      expect(usuarioNoBanco?.tokenConvite).toEqual(expect.any(String));
    });

    it('bloqueia e-mail já cadastrado no Estabelecimento', async () => {
      await request(app.getHttpServer())
        .post('/supervisores')
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .send({ nome: 'João Duplicado', email: 'joao@empresa.com', unidadeId })
        .expect(409);
    });
  });

  describe('UC05 — Gerenciar perfis de acesso', () => {
    it('promove um Entregador a Supervisor local da mesma Unidade e registra auditoria', async () => {
      const entregador = await criarUsuario({
        estabelecimentoId,
        unidadeId,
        perfil: Perfil.ENTREGADOR,
      });

      const resposta = await request(app.getHttpServer())
        .patch(`/usuarios/${entregador.id}/perfil`)
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .send({ perfil: Perfil.SUPERVISOR_LOCAL, unidadeId })
        .expect(200);

      expect(resposta.body.perfil).toBe(Perfil.SUPERVISOR_LOCAL);

      const auditorias = await prisma.auditoria.findMany({
        where: {
          entidade: 'Usuario',
          campo: 'perfil',
          valorNovo: Perfil.SUPERVISOR_LOCAL,
        },
      });
      expect(auditorias.length).toBeGreaterThan(0);
    });

    it('bloqueia vincular usuário a uma Unidade de outro Estabelecimento', async () => {
      const outro = await criarEstabelecimentoComSupervisorGeral();
      const entregador = await criarUsuario({
        estabelecimentoId,
        unidadeId,
        perfil: Perfil.ENTREGADOR,
      });

      await request(app.getHttpServer())
        .patch(`/usuarios/${entregador.id}/perfil`)
        .set('Authorization', `Bearer ${tokenSupervisorGeral}`)
        .send({ perfil: Perfil.SUPERVISOR_LOCAL, unidadeId: outro.unidade.id })
        .expect(400);
    });
  });
});
