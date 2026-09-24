import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard';
import { PerfilGuard } from './common/auth/perfil.guard';
import { CommonModule } from './common/common.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { EntregadoresModule } from './entregadores/entregadores.module';
import { ParametrosModule } from './parametros/parametros.module';
import { PerfisModule } from './perfis/perfis.module';
import { PontosModule } from './pontos/pontos.module';
import { SupervisoresModule } from './supervisores/supervisores.module';
import { UnidadesModule } from './unidades/unidades.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    AuthModule,
    UnidadesModule,
    SupervisoresModule,
    ParametrosModule,
    PerfisModule,
    EntregadoresModule,
    PontosModule,
  ],
  controllers: [AppController],
  providers: [
    // RNF04: toda rota exige autenticação (exceto @Public()) e respeita o perfil do ator.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PerfilGuard },
  ],
})
export class AppModule {}
