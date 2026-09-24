import { Module } from '@nestjs/common';
import { RoteirosController } from './roteiros.controller';
import { RoteirosService } from './roteiros.service';

@Module({
  controllers: [RoteirosController],
  providers: [RoteirosService],
})
export class RoteirosModule {}
