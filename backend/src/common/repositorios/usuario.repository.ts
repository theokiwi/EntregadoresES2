import { Injectable } from '@nestjs/common';
import { Perfil, TipoCombustivel, Usuario } from '../../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CriarUsuarioInput {
  estabelecimentoId: string;
  unidadeId: string | null;
  email: string;
  senhaHash: string;
  perfil: Perfil;
  nome: string;
  telefone?: string | null;
  documento?: string | null;
  veiculo?: string | null;
  tipoCombustivel?: TipoCombustivel | null;
  rendimentoKmLitro?: number | null;
  tokenConvite?: string | null;
  tokenConviteExpiraEm?: Date | null;
}

/** RepositorioUsuario (modelo-projeto.puml) — único ponto de acesso a `Usuario`. */
@Injectable()
export class UsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  // UC00 (login): e-mail é único no sistema, resolve o Usuario sem conhecer o tenant.
  findByEmail(email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({ where: { email } });
  }

  findById(estabelecimentoId: string, id: string): Promise<Usuario | null> {
    return this.prisma.usuario.findFirst({ where: { id, estabelecimentoId } });
  }

  findByTokenConvite(token: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({ where: { tokenConvite: token } });
  }

  // UC05, passo 1: busca por nome ou e-mail, restrita ao Estabelecimento do Supervisor geral.
  buscar(estabelecimentoId: string, termo: string): Promise<Usuario[]> {
    return this.prisma.usuario.findMany({
      where: {
        estabelecimentoId,
        OR: [
          { nome: { contains: termo, mode: 'insensitive' } },
          { email: { contains: termo, mode: 'insensitive' } },
        ],
      },
      orderBy: { nome: 'asc' },
    });
  }

  create(input: CriarUsuarioInput): Promise<Usuario> {
    return this.prisma.usuario.create({ data: input });
  }

  // UC06, passo 5: lista de Entregadores da Unidade.
  listEntregadoresPorUnidade(
    estabelecimentoId: string,
    unidadeId: string,
  ): Promise<Usuario[]> {
    return this.prisma.usuario.findMany({
      where: { estabelecimentoId, unidadeId, perfil: Perfil.ENTREGADOR },
      orderBy: { nome: 'asc' },
    });
  }

  definirSenha(usuarioId: string, senhaHash: string): Promise<Usuario> {
    return this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        senhaHash,
        senhaDefinida: true,
        tokenConvite: null,
        tokenConviteExpiraEm: null,
      },
    });
  }

  atribuirPerfil(
    estabelecimentoId: string,
    usuarioId: string,
    perfil: Perfil,
    unidadeId: string | null,
  ): Promise<Usuario> {
    return this.prisma.usuario.update({
      where: { id: usuarioId, estabelecimentoId },
      data: { perfil, unidadeId },
    });
  }
}
