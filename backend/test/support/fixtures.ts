import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Perfil } from '../../generated/prisma/client';
import { prisma } from './db';

export const SENHA_PADRAO = 'senha-de-teste-123';

export async function criarEstabelecimentoComSupervisorGeral() {
  const sufixo = randomUUID().slice(0, 8);
  const estabelecimento = await prisma.estabelecimento.create({
    data: { nome: `Estabelecimento ${sufixo}` },
  });
  const unidade = await prisma.unidade.create({
    data: {
      estabelecimentoId: estabelecimento.id,
      nome: `Filial ${sufixo}`,
      endereco: 'Rua de Teste, 1',
      fusoHorario: 'America/Sao_Paulo',
    },
  });
  const supervisorGeral = await prisma.usuario.create({
    data: {
      estabelecimentoId: estabelecimento.id,
      unidadeId: null,
      email: `supervisor-geral-${sufixo}@teste.com`,
      nome: 'Supervisor Geral de Teste',
      perfil: Perfil.SUPERVISOR_GERAL,
      senhaHash: await bcrypt.hash(SENHA_PADRAO, 10),
      senhaDefinida: true,
      ativo: true,
    },
  });
  return { estabelecimento, unidade, supervisorGeral };
}

export async function criarUsuario(params: {
  estabelecimentoId: string;
  unidadeId: string | null;
  perfil: Perfil;
  ativo?: boolean;
}) {
  const sufixo = randomUUID().slice(0, 8);
  return prisma.usuario.create({
    data: {
      estabelecimentoId: params.estabelecimentoId,
      unidadeId: params.unidadeId,
      email: `usuario-${sufixo}@teste.com`,
      nome: `Usuário ${sufixo}`,
      perfil: params.perfil,
      senhaHash: await bcrypt.hash(SENHA_PADRAO, 10),
      senhaDefinida: true,
      ativo: params.ativo ?? true,
    },
  });
}

export async function login(
  app: INestApplication,
  email: string,
  senha = SENHA_PADRAO,
): Promise<string> {
  const resposta = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, senha });
  return resposta.body.accessToken;
}
