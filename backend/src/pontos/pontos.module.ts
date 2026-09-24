import { Module } from '@nestjs/common';
import { PontosController } from './pontos.controller';
import { PontosService } from './pontos.service';

@Module({
  controllers: [PontosController],
  providers: [PontosService],
})
export class PontosModule {}
