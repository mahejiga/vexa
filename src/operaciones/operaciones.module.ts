import { Module } from '@nestjs/common';
import { OperacionesService } from './operaciones.service';
import { OperacionesController } from './operaciones.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CotizadorPublicoModule } from '../cotizador-publico/cotizador-publico.module';

@Module({
  imports: [PrismaModule, CotizadorPublicoModule],
  providers: [OperacionesService],
  controllers: [OperacionesController],
  exports: [OperacionesService],
})
export class OperacionesModule {}
