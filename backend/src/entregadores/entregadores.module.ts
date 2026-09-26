import { Module } from '@nestjs/common';
import { EntregadoresController } from './entregadores.controller';
import { EntregadoresService } from './entregadores.service';
import { AssinaturasModule } from '../assinaturas/assinaturas.module';

@Module({
  imports: [AssinaturasModule],
  controllers: [EntregadoresController],
  providers: [EntregadoresService],
})
export class EntregadoresModule {}
