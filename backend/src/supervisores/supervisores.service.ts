import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Perfil, Prisma, Usuario } from '../../generated/prisma/client';
import { MailerService } from '../common/mailer/mailer.service';
import { UnidadeRepository } from '../common/repositorios/unidade.repository';
import { UsuarioRepository } from '../common/repositorios/usuario.repository';
import { CriarSupervisorDto } from './dto/criar-supervisor.dto';

const CONVITE_VALIDADE_DIAS = 7;

/** UC02 — Cadastrar supervisor local. */
@Injectable()
export class SupervisoresService {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly unidadesRepo: UnidadeRepository,
    private readonly mailer: MailerService,
  ) {}

  async criar(
    estabelecimentoId: string,
    dto: CriarSupervisorDto,
  ): Promise<Usuario> {
    const unidade = await this.unidadesRepo.findById(
      estabelecimentoId,
      dto.unidadeId,
    );
    if (!unidade) {
      throw new NotFoundException(
        'Unidade não encontrada neste Estabelecimento.',
      );
    }

    const senhaAleatoria = randomBytes(32).toString('hex');
    const tokenConvite = randomBytes(32).toString('hex');
    const tokenConviteExpiraEm = new Date(
      Date.now() + CONVITE_VALIDADE_DIAS * 24 * 60 * 60 * 1000,
    );

    let supervisor: Usuario;
    try {
      supervisor = await this.usuarios.create({
        estabelecimentoId,
        unidadeId: dto.unidadeId,
        email: dto.email,
        nome: dto.nome,
        telefone: dto.telefone,
        perfil: Perfil.SUPERVISOR_LOCAL,
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
          `E-mail "${dto.email}" já está cadastrado neste Estabelecimento.`,
        );
      }
      throw erro;
    }

    await this.mailer.enviarConvite(supervisor.email, tokenConvite);
    return supervisor;
  }
}
