import { Module } from '@nestjs/common';
import { SugerenciasService } from './sugerencias.service';
import { SugerenciasController } from './sugerencias.controller';
import { ZonasFrancasModule } from '../zonas-francas/zonas-francas.module';

@Module({
  imports: [ZonasFrancasModule],
  providers: [SugerenciasService],
  controllers: [SugerenciasController],
  exports: [SugerenciasService],
})
export class SugerenciasModule {}
