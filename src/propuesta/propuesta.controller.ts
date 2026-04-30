import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { PropuestaService } from './propuesta.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('propuesta')
@UseGuards(JwtAuthGuard)
export class PropuestaController {
  constructor(private readonly propuestaService: PropuestaService) {}

  @Get(':operacionId/pdf')
  async descargarPdf(
    @Param('operacionId') operacionId: string,
    @Res() res: Response,
  ) {
    const buffer = await this.propuestaService.generarPdf(operacionId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="propuesta-${operacionId}.pdf"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
