import { Global, Module } from '@nestjs/common';
import { MailerService } from './mailer/mailer.service';
import { AuditoriaRepository } from './repositorios/auditoria.repository';
import { ParametroRepository } from './repositorios/parametro.repository';
import { PontoRepository } from './repositorios/ponto.repository';
import { RoteiroRepository } from './repositorios/roteiro.repository';
import { UnidadeRepository } from './repositorios/unidade.repository';
import { UsuarioRepository } from './repositorios/usuario.repository';
import { TenantContextService } from './tenant/tenant-context.service';

const REPOSITORIOS = [
  UsuarioRepository,
  UnidadeRepository,
  ParametroRepository,
  AuditoriaRepository,
  PontoRepository,
  RoteiroRepository,
];

@Global()
@Module({
  providers: [TenantContextService, MailerService, ...REPOSITORIOS],
  exports: [TenantContextService, MailerService, ...REPOSITORIOS],
})
export class CommonModule {}
