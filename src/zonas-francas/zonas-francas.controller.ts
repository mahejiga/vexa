import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { ZonasFrancasService } from './zonas-francas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Zonas Francas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('zonas-francas')
export class ZonasFrancasController {
  constructor(private zfService: ZonasFrancasService) {}

  @Get()
  findAll() {
    return this.zfService.findAll();
  }

  @Get('dashboard')
  dashboard() {
    return this.zfService.resumenDashboard();
  }

  @Put(':id/ocupacion')
  actualizarOcupacion(@Param('id') id: string, @Body('ocupacionM2') ocupacionM2: number) {
    return this.zfService.actualizarOcupacion(id, ocupacionM2);
  }
}
