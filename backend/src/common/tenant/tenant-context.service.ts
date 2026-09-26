import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload } from '../auth/jwt-payload.interface';

/**
 * Escopo multi-tenant da requisição atual, resolvido a partir do JWT (arquitetura.md:
 * "middleware injeta o estabelecimentoId do token JWT em toda consulta").
 * Consumido pelos repositórios para nunca deixar uma query sem o filtro de tenant.
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  private get user(): JwtPayload {
    const user = (this.request as Request & { user?: JwtPayload }).user;
    if (!user) {
      throw new UnauthorizedException('Requisição sem usuário autenticado.');
    }
    return user;
  }

  get usuarioId(): string {
    return this.user.sub;
  }

  get perfil() {
    return this.user.perfil;
  }

  get estabelecimentoId(): string {
    return this.user.estabelecimentoId;
  }

  /** Nulo quando o perfil é SupervisorGeral (escopo = todo o Estabelecimento). */
  get unidadeId(): string | null {
    return this.user.unidadeId;
  }
}
