import { Module } from '@nestjs/common';
import { SupervisoresController } from './supervisores.controller';
import { SupervisoresService } from './supervisores.service';

@Module({
  controllers: [SupervisoresController],
  providers: [SupervisoresService],
})
export class SupervisoresModule {}
