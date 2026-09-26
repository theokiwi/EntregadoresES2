import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  Perfil,
  PlanoAssinatura,
  Prisma,
  StatusAssinatura,
} from '../../generated/prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { AlterarPlanoDto } from './dto/alterar-plano.dto';
import { ContratarAssinaturaDto } from './dto/contratar-assinatura.dto';
import { PLANOS } from './planos';

@Injectable()
export class AssinaturasService {
  constructor(private readonly prisma: PrismaService) {}

  listarPlanos() {
    return Object.entries(PLANOS).map(([codigo, plano]) => ({
      codigo,
      ...plano,
    }));
  }

  async contratar(dto: ContratarAssinaturaDto) {
    const plano = PLANOS[dto.plano];
    const digitos = dto.numeroCartao.replace(/\D/g, '');
    if (digitos.length !== 16)
      throw new ConflictException(
        'Informe um cartão com 16 dígitos para a simulação.',
      );
    const proximaCobranca = new Date();
    proximaCobranca.setMonth(proximaCobranca.getMonth() + 1);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const estabelecimento = await tx.estabelecimento.create({
          data: { nome: dto.empresaNome },
        });
        const unidade = await tx.unidade.create({
          data: {
            estabelecimentoId: estabelecimento.id,
            nome: dto.unidadeNome,
            endereco: dto.endereco,
            fusoHorario: 'America/Sao_Paulo',
          },
        });
        await tx.parametro.create({
          data: {
            unidadeId: unidade.id,
            valorCombustivel: 0,
            custoPorKm: 0,
            jornadaPadraoHoras: 8,
          },
        });
        const usuario = await tx.usuario.create({
          data: {
            estabelecimentoId: estabelecimento.id,
            nome: dto.administradorNome,
            email: dto.email.toLowerCase(),
            senhaHash: await bcrypt.hash(dto.senha, 10),
            senhaDefinida: true,
            perfil: Perfil.SUPERVISOR_GERAL,
          },
        });
        const assinatura = await tx.assinatura.create({
          data: {
            estabelecimentoId: estabelecimento.id,
            plano: dto.plano,
            valorMensal: plano.valorMensal,
            proximaCobranca,
            pagamentoMock: true,
            cartaoFinal: digitos.slice(-4),
          },
        });
        return {
          usuarioId: usuario.id,
          assinatura: this.serializar(assinatura),
        };
      });
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2002'
      )
        throw new ConflictException('Este e-mail já está cadastrado.');
      throw erro;
    }
  }

  async consultar(estabelecimentoId: string) {
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { estabelecimentoId },
    });
    if (!assinatura) throw new NotFoundException('Assinatura não encontrada.');
    return this.serializar(assinatura);
  }

  async alterarPlano(estabelecimentoId: string, dto: AlterarPlanoDto) {
    const plano = PLANOS[dto.plano];
    const [unidades, entregadores] = await Promise.all([
      this.prisma.unidade.count({ where: { estabelecimentoId } }),
      this.prisma.usuario.count({
        where: { estabelecimentoId, perfil: Perfil.ENTREGADOR, ativo: true },
      }),
    ]);
    if (
      unidades > plano.limiteUnidades ||
      entregadores > plano.limiteEntregadores
    ) {
      throw new ConflictException(
        `O plano ${plano.nome} comporta até ${plano.limiteUnidades} unidade(s) e ${plano.limiteEntregadores} entregadores. Reduza o uso antes de mudar.`,
      );
    }
    const assinatura = await this.prisma.assinatura.update({
      where: { estabelecimentoId },
      data: {
        plano: dto.plano,
        valorMensal: plano.valorMensal,
        status: StatusAssinatura.ATIVA,
      },
    });
    return this.serializar(assinatura);
  }

  async validarNovoRecurso(
    estabelecimentoId: string,
    recurso: 'unidade' | 'entregador',
  ) {
    const assinatura = await this.prisma.assinatura.findUnique({
      where: { estabelecimentoId },
    });
    // Estabelecimentos legados, criados antes do módulo de assinatura, continuam operando.
    if (!assinatura) return;
    const plano = PLANOS[assinatura.plano];
    const atual =
      recurso === 'unidade'
        ? await this.prisma.unidade.count({ where: { estabelecimentoId } })
        : await this.prisma.usuario.count({
            where: {
              estabelecimentoId,
              perfil: Perfil.ENTREGADOR,
              ativo: true,
            },
          });
    const limite =
      recurso === 'unidade' ? plano.limiteUnidades : plano.limiteEntregadores;
    if (atual >= limite)
      throw new ForbiddenException(
        `Limite de ${limite} ${recurso}(s) atingido no plano ${plano.nome}. Altere sua assinatura para continuar.`,
      );
  }

  private serializar(assinatura: {
    id: string;
    plano: PlanoAssinatura;
    status: StatusAssinatura;
    valorMensal: Prisma.Decimal;
    proximaCobranca: Date;
    pagamentoMock: boolean;
    cartaoFinal: string | null;
  }) {
    return { ...assinatura, valorMensal: Number(assinatura.valorMensal) };
  }
}
