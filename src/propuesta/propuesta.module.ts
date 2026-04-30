import { Module } from '@nestjs/common';
import { PropuestaController } from './propuesta.controller';
import { PropuestaService } from './propuesta.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PropuestaController],
  providers: [PropuestaService],
})
export class PropuestaModule {}
