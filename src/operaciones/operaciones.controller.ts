import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { OperacionesService } from './operaciones.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Operaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('operaciones')
export class OperacionesController {
  constructor(private operacionesService: OperacionesService) {}

  @Get()
  findAll(
    @Query('estado') estado?: any,
    @Query('clienteId') clienteId?: string,
    @Query('puertoEntrada') puertoEntrada?: any,
    @Query('busqueda') busqueda?: string,
  ) {
    return this.operacionesService.findAll({ estado, clienteId, puertoEntrada, busqueda });
  }

  @Get('stats')
  stats() {
    return this.operacionesService.stats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.operacionesService.findOne(id);
  }

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.operacionesService.create({ ...body, creadoPor: req.user.id });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.operacionesService.update(id, body, req.user.id);
  }

  @Put(':id/estado')
  cambiarEstado(@Param('id') id: string, @Body('estado') estado: any, @Request() req: any) {
    return this.operacionesService.cambiarEstado(id, estado, req.user.id);
  }

  @Put(':id/asignar-zf')
  asignarZF(@Param('id') id: string, @Body('zonaFrancaId') zonaFrancaId: string, @Request() req: any) {
    return this.operacionesService.asignarZonaFranca(id, zonaFrancaId, req.user.id);
  }

  // ── Cotizaciones navieras ───────────────────────────────────────────────
  @Post(':id/cotizar')
  cotizar(
    @Param('id') id: string,
    @Body('origenUNLOCODE') origenUNLOCODE: string,
    @Request() req: any,
  ) {
    return this.operacionesService.cotizarNavieras(id, req.user.id, origenUNLOCODE);
  }

  @Put(':id/cotizaciones/:cotId/seleccionar')
  seleccionarCotizacion(
    @Param('id') id: string,
    @Param('cotId') cotId: string,
    @Request() req: any,
  ) {
    return this.operacionesService.seleccionarCotizacion(id, cotId, req.user.id);
  }
}
