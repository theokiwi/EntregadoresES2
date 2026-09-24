import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Perfil } from '../../../generated/prisma/client';
import { JwtPayload } from './jwt-payload.interface';
import { PERFIS_KEY } from './perfis.decorator';

/**
 * Supervisor geral satisfaz qualquer exigência de Supervisor local (generalização de
 * atores, atores.md) — o escopo de dado (uma Unidade vs. todo o Estabelecimento) é
 * resolvido pelos repositórios a partir do unidadeId, não por este guard.
 */
@Injectable()
export class PerfilGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfisPermitidos = this.reflector.getAllAndOverride<Perfil[]>(
      PERFIS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!perfisPermitidos || perfisPermitidos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload | undefined = request.user;
    if (!user) {
      return false;
    }

    const permitido =
      perfisPermitidos.includes(user.perfil) ||
      (user.perfil === Perfil.SUPERVISOR_GERAL &&
        perfisPermitidos.includes(Perfil.SUPERVISOR_LOCAL));

    if (!permitido) {
      throw new ForbiddenException('Perfil sem permissão para esta operação.');
    }
    return true;
  }
}
