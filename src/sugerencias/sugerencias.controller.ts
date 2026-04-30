import { Controller, Get, Post, Put, Param, UseGuards } from '@nestjs/common';
import { SugerenciasService } from './sugerencias.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Sugerencias')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sugerencias')
export class SugerenciasController {
  constructor(private sugerenciasService: SugerenciasService) {}

  @Post('generar/:operacionId')
  generar(@Param('operacionId') operacionId: string) {
    return this.sugerenciasService.generarParaOperacion(operacionId);
  }

  @Put(':id/aceptar')
  aceptar(@Param('id') id: string) {
    return this.sugerenciasService.aceptar(id);
  }

  @Put(':id/rechazar')
  rechazar(@Param('id') id: string) {
    return this.sugerenciasService.rechazar(id);
  }
}
