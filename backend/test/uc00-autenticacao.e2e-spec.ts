import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Perfil } from '../generated/prisma/client';
import { criarApp } from './support/app';
import { limparBanco, prisma } from './support/db';
import {
  criarEstabelecimentoComSupervisorGeral,
  criarUsuario,
  SENHA_PADRAO,
} from './support/fixtures';

describe('UC00 — Autenticar-se (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await limparBanco();
    app = await criarApp();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('emite token com perfil, estabelecimentoId e unidadeId ao autenticar com credenciais corretas', async () => {
    const { supervisorGeral, estabelecimento } =
      await criarEstabelecimentoComSupervisorGeral();

    const resposta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: supervisorGeral.email, senha: SENHA_PADRAO })
      .expect(200);

    expect(resposta.body.accessToken).toEqual(expect.any(String));
    expect(resposta.body.perfil).toBe(Perfil.SUPERVISOR_GERAL);
    expect(resposta.body.estabelecimentoId).toBe(estabelecimento.id);
    expect(resposta.body.unidadeId).toBeNull();
  });

  it('rejeita senha incorreta com mensagem genérica e sem emitir token', async () => {
    const { supervisorGeral } = await criarEstabelecimentoComSupervisorGeral();

    const resposta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: supervisorGeral.email, senha: 'senha-errada' })
      .expect(401);

    expect(resposta.body.message).toBe('E-mail ou senha inválidos.');
    expect(resposta.body.accessToken).toBeUndefined();
  });

  it('rejeita e-mail inexistente com a mesma mensagem genérica (não revela se o e-mail existe)', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'ninguem@teste.com', senha: 'qualquer-coisa' })
      .expect(401);

    expect(resposta.body.message).toBe('E-mail ou senha inválidos.');
  });

  it('bloqueia usuário inativo com mensagem específica mesmo com senha correta', async () => {
    const { estabelecimento, unidade } =
      await criarEstabelecimentoComSupervisorGeral();
    const inativo = await criarUsuario({
      estabelecimentoId: estabelecimento.id,
      unidadeId: unidade.id,
      perfil: Perfil.ENTREGADOR,
      ativo: false,
    });

    const resposta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: inativo.email, senha: SENHA_PADRAO })
      .expect(403);

    expect(resposta.body.message).toBe(
      'Usuário inativo, contate seu supervisor.',
    );
  });
});
