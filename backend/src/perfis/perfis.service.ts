import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Perfil, Usuario } from '../../generated/prisma/client';
import { AuditoriaRepository } from '../common/repositorios/auditoria.repository';
import { UnidadeRepository } from '../common/repositorios/unidade.repository';
import { UsuarioRepository } from '../common/repositorios/usuario.repository';
import { AtribuirPerfilDto } from './dto/atribuir-perfil.dto';

/** UC05 — Gerenciar perfis de acesso. */
@Injectable()
export class PerfisService {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly unidadesRepo: UnidadeRepository,
    private readonly auditoria: AuditoriaRepository,
  ) {}

  buscar(estabelecimentoId: string, termo: string): Promise<Usuario[]> {
    return this.usuarios.buscar(estabelecimentoId, termo);
  }

  async atribuir(
    estabelecimentoId: string,
    autorId: string,
    usuarioAlvoId: string,
    dto: AtribuirPerfilDto,
  ): Promise<Usuario> {
    const alvo = await this.usuarios.findById(estabelecimentoId, usuarioAlvoId);
    if (!alvo) {
      throw new NotFoundException(
        'Usuário não encontrado neste Estabelecimento.',
      );
    }

    // ADR-014: unidadeId nulo só é válido para SupervisorGeral (escopo = Estabelecimento todo).
    const novoUnidadeId =
      dto.perfil === Perfil.SUPERVISOR_GERAL ? null : (dto.unidadeId ?? null);
    if (dto.perfil !== Perfil.SUPERVISOR_GERAL) {
      if (!novoUnidadeId) {
        throw new BadRequestException(
          'Unidade é obrigatória para os perfis Entregador e Supervisor local.',
        );
      }
      // 4a: Unidade de outro Estabelecimento nunca é uma opção válida — isolamento multi-tenant.
      const unidade = await this.unidadesRepo.findById(
        estabelecimentoId,
        novoUnidadeId,
      );
      if (!unidade) {
        throw new BadRequestException(
          'Unidade não pertence a este Estabelecimento.',
        );
      }
    }

    const perfilAnterior = alvo.perfil;
    const unidadeAnteriorId = alvo.unidadeId;

    const atualizado = await this.usuarios.atribuirPerfil(
      estabelecimentoId,
      usuarioAlvoId,
      dto.perfil,
      novoUnidadeId,
    );

    if (perfilAnterior !== dto.perfil) {
      await this.auditoria.registrar({
        estabelecimentoId,
        autorId,
        entidade: 'Usuario',
        campo: 'perfil',
        valorAnterior: perfilAnterior,
        valorNovo: dto.perfil,
      });
    }
    if (unidadeAnteriorId !== novoUnidadeId) {
      await this.auditoria.registrar({
        estabelecimentoId,
        autorId,
        entidade: 'Usuario',
        campo: 'unidadeId',
        valorAnterior: unidadeAnteriorId ?? '(nenhuma)',
        valorNovo: novoUnidadeId ?? '(nenhuma)',
      });
    }

    return atualizado;
  }
}
