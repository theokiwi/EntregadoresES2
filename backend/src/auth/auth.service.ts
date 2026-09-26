import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuarioRepository } from '../common/repositorios/usuario.repository';

export interface SessaoToken {
  accessToken: string;
  usuarioId: string;
  nome: string;
  perfil: string;
  estabelecimentoId: string;
  unidadeId: string | null;
}

/** UC00 — Autenticar-se. */
@Injectable()
export class AuthService {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly jwt: JwtService,
  ) {}

  async autenticar(email: string, senha: string): Promise<SessaoToken> {
    const usuario = await this.usuarios.findByEmail(email);
    const senhaValida = usuario
      ? await bcrypt.compare(senha, usuario.senhaHash)
      : false;

    // Mensagem genérica para e-mail inexistente ou senha errada (RNF06 — não revela qual).
    if (!usuario || !senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    if (!usuario.ativo) {
      throw new ForbiddenException('Usuário inativo, contate seu supervisor.');
    }

    const accessToken = await this.jwt.signAsync({
      sub: usuario.id,
      perfil: usuario.perfil,
      estabelecimentoId: usuario.estabelecimentoId,
      unidadeId: usuario.unidadeId,
    });

    return {
      accessToken,
      usuarioId: usuario.id,
      nome: usuario.nome,
      perfil: usuario.perfil,
      estabelecimentoId: usuario.estabelecimentoId,
      unidadeId: usuario.unidadeId,
    };
  }

  // Mecanismo do convite (UC02/UC06, "status Convite pendente até o primeiro acesso").
  async definirSenha(token: string, novaSenha: string): Promise<void> {
    const usuario = await this.usuarios.findByTokenConvite(token);
    if (
      !usuario ||
      !usuario.tokenConviteExpiraEm ||
      usuario.tokenConviteExpiraEm < new Date()
    ) {
      throw new BadRequestException('Convite inválido ou expirado.');
    }
    await this.usuarios.definirSenha(
      usuario.id,
      await bcrypt.hash(novaSenha, 10),
    );
  }
}
