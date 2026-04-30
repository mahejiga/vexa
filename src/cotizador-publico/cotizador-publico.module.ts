import { Module } from '@nestjs/common';
import { CotizadorPublicoController } from './cotizador-publico.controller';
import { MaerskService }     from './carriers/maersk.service';
import { HapagLloydService } from './carriers/hapag-lloyd.service';
import { CmaCgmService }     from './carriers/cma-cgm.service';
import { RateCacheService }  from './carriers/rate-cache.service';
import { PrismaModule }      from '../prisma/prisma.module';

@Module({
  imports:     [PrismaModule],
  controllers: [CotizadorPublicoController],
  providers:   [MaerskService, HapagLloydService, CmaCgmService, RateCacheService],
  exports:     [MaerskService, HapagLloydService, CmaCgmService, RateCacheService],
})
export class CotizadorPublicoModule {}
