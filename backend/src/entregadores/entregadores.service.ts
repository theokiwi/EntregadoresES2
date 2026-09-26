import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Perfil, Prisma, Usuario } from '../../generated/prisma/client';
import { UnidadeRepository } from '../common/repositorios/unidade.repository';
import { UsuarioRepository } from '../common/repositorios/usuario.repository';
import { resolverUnidadeAlvo } from '../common/tenant/resolver-unidade-alvo';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CriarEntregadorDto } from './dto/criar-entregador.dto';
import { AssinaturasService } from '../assinaturas/assinaturas.service';

const CONVITE_VALIDADE_DIAS = 7;

/** UC06 — Cadastrar entregador. */
@Injectable()
export class EntregadoresService {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly unidades: UnidadeRepository,
    private readonly assinaturas: AssinaturasService,
  ) {}

  async criar(
    tenant: TenantContextService,
    dto: CriarEntregadorDto,
  ): Promise<Usuario> {
    await this.assinaturas.validarNovoRecurso(
      tenant.estabelecimentoId,
      'entregador',
    );
    const unidadeId = await resolverUnidadeAlvo(
      tenant,
      this.unidades,
      dto.unidadeId,
    );

    const senhaAleatoria = randomBytes(32).toString('hex');
    const tokenConvite = randomBytes(32).toString('hex');
    const tokenConviteExpiraEm = new Date(
      Date.now() + CONVITE_VALIDADE_DIAS * 24 * 60 * 60 * 1000,
    );
    const email = dto.email ?? `${dto.documento}@convite.entregadores.local`;

    try {
      return await this.usuarios.create({
        estabelecimentoId: tenant.estabelecimentoId,
        unidadeId,
        email,
        nome: dto.nome,
        telefone: dto.telefone,
        documento: dto.documento,
        veiculo: dto.veiculo,
        tipoCombustivel: dto.tipoCombustivel,
        rendimentoKmLitro: dto.rendimentoKmLitro,
        perfil: Perfil.ENTREGADOR,
        senhaHash: await bcrypt.hash(senhaAleatoria, 10),
        tokenConvite,
        tokenConviteExpiraEm,
      });
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2002'
      ) {
        throw new ConflictException(
          `Já existe um entregador com o documento "${dto.documento}" neste Estabelecimento.`,
        );
      }
      throw erro;
    }
  }

  listar(
    tenant: TenantContextService,
    unidadeIdConsultado?: string,
  ): Promise<Usuario[]> {
    const unidadeId = tenant.unidadeId ?? unidadeIdConsultado;
    if (!unidadeId) {
      throw new BadRequestException(
        'Informe a Unidade para listar os entregadores.',
      );
    }
    return this.usuarios.listEntregadoresPorUnidade(
      tenant.estabelecimentoId,
      unidadeId,
    );
  }
}
