import {
  Controller, Get, Post, Param, Body, Res, UseGuards, Request, Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LeadsService } from './leads.service';

@ApiTags('Leads / Cotizaciones Públicas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  private readonly logger = new Logger(LeadsController.name);

  constructor(private readonly leadsService: LeadsService) {}

  // ── Listar todos los leads ────────────────────────────────────────────────
  @Get()
  findAll() {
    return this.leadsService.findAll();
  }

  // ── Contador de leads nuevos (para dashboard) ─────────────────────────────
  @Get('count/nuevas')
  async contarNuevas() {
    const total = await this.leadsService.contarNuevas();
    return { nuevas: total };
  }

  // ── Detalle de un lead ────────────────────────────────────────────────────
  @Get(':numero')
  findOne(@Param('numero') numero: string) {
    return this.leadsService.findOne(numero);
  }

  // ── Descargar PDF de la cotización ────────────────────────────────────────
  @Get(':numero/pdf')
  async descargarPdf(@Param('numero') numero: string, @Res() res: Response) {
    const pdf = await this.leadsService.generarPdf(numero);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="VEXA-Cotizacion-${numero}.pdf"`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }

  // ── Enviar cotización por email ────────────────────────────────────────────
  @Post(':numero/enviar-email')
  async enviarEmail(@Param('numero') numero: string, @Request() req: any) {
    return this.leadsService.enviarEmail(numero, req.user.id);
  }

  // ── Convertir lead en operación ───────────────────────────────────────────
  @Post(':numero/convertir')
  async convertir(
    @Param('numero') numero: string,
    @Body() body: { cotizacionId: string },
    @Request() req: any,
  ) {
    return this.leadsService.convertirEnOperacion(numero, body.cotizacionId, req.user.id);
  }
}
