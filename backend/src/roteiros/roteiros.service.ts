import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Perfil } from '../../generated/prisma/client';
import { PontoRepository } from '../common/repositorios/ponto.repository';
import { RoteiroRepository } from '../common/repositorios/roteiro.repository';
import { UnidadeRepository } from '../common/repositorios/unidade.repository';
import { UsuarioRepository } from '../common/repositorios/usuario.repository';
import { resolverUnidadeAlvo } from '../common/tenant/resolver-unidade-alvo';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { MontarRoteiroDto } from './dto/montar-roteiro.dto';

/** Normaliza para meia-noite UTC — coluna @db.Date não guarda hora. */
function paraDataSemHora(valor: string | Date): Date {
  const iso = typeof valor === 'string' ? valor : valor.toISOString();
  return new Date(iso.slice(0, 10));
}

/** UC09 — Montar roteiro diário; UC10 — Consultar roteiro do dia. */
@Injectable()
export class RoteirosService {
  constructor(
    private readonly roteiros: RoteiroRepository,
    private readonly pontos: PontoRepository,
    private readonly unidades: UnidadeRepository,
    private readonly usuarios: UsuarioRepository,
  ) {}

  async montar(tenant: TenantContextService, dto: MontarRoteiroDto) {
    const unidadeId = await resolverUnidadeAlvo(
      tenant,
      this.unidades,
      dto.unidadeId,
    );

    const entregador = await this.usuarios.findById(
      tenant.estabelecimentoId,
      dto.entregadorId,
    );
    if (
      !entregador ||
      entregador.perfil !== Perfil.ENTREGADOR ||
      entregador.unidadeId !== unidadeId
    ) {
      throw new BadRequestException('Entregador não encontrado nesta Unidade.');
    }

    const data = paraDataSemHora(dto.data);

    // RN05, fluxo alternativo 2a.
    const existente = await this.roteiros.findByEntregadorEData(
      entregador.id,
      data,
    );
    if (existente) {
      throw new ConflictException(
        'Este Entregador já possui um roteiro para essa data. Edite o roteiro existente.',
      );
    }

    const pontosValidos = await this.pontos.listByIds(
      tenant.estabelecimentoId,
      unidadeId,
      dto.pontoIds,
    );
    if (pontosValidos.length !== new Set(dto.pontoIds).size) {
      throw new BadRequestException(
        'Um ou mais pontos não pertencem a esta Unidade.',
      );
    }

    return this.roteiros.criar({
      estabelecimentoId: tenant.estabelecimentoId,
      unidadeId,
      entregadorId: entregador.id,
      data,
      pontoIds: dto.pontoIds,
    });
  }

  // UC10 — só o próprio Entregador consulta o próprio roteiro (ADR-003, RNF06).
  // Resposta sempre envelopada em `{ roteiro }`: Express serializa `null` cru como corpo
  // vazio (não como JSON `null`), o que o cliente não conseguiria distinguir de um erro.
  async consultarDoDia(tenant: TenantContextService) {
    const hoje = paraDataSemHora(new Date());
    const roteiro = await this.roteiros.buscarDoEntregadorNaData(
      tenant.estabelecimentoId,
      tenant.usuarioId,
      hoje,
    );
    return { roteiro }; // roteiro: null → frontend exibe "Nenhum roteiro disponível para hoje" (fluxo 2a).
  }

  async consultarPorId(tenant: TenantContextService, id: string) {
    const roteiro = await this.roteiros.buscarComItens(
      tenant.estabelecimentoId,
      id,
    );
    if (!roteiro) {
      throw new NotFoundException('Roteiro não encontrado.');
    }
    // ADR-003/RNF06: Entregador nunca consulta o roteiro de outro Entregador.
    if (
      tenant.perfil === Perfil.ENTREGADOR &&
      roteiro.entregadorId !== tenant.usuarioId
    ) {
      throw new ForbiddenException('Você só pode consultar o próprio roteiro.');
    }
    return roteiro;
  }
}
