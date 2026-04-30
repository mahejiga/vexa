import { Module } from '@nestjs/common';
import { ZonasFrancasService } from './zonas-francas.service';
import { ZonasFrancasController } from './zonas-francas.controller';

@Module({
  providers: [ZonasFrancasService],
  controllers: [ZonasFrancasController],
  exports: [ZonasFrancasService],
})
export class ZonasFrancasModule {}
