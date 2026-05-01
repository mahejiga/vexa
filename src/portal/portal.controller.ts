import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PortalService } from './portal.service';

@ApiTags('Portal Cliente')
@Controller('portal')
export class PortalController {
  constructor(private readonly portal: PortalService) {}

  @Post('auth')
  autenticar(@Body() body: { email: string; numeroCotizacion: string }) {
    return this.portal.autenticar(body.email, body.numeroCotizacion);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-operaciones')
  misOperaciones(@Request() req: any) {
    return this.portal.misOperaciones(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('mis-cotizaciones')
  misCotizaciones(@Request() req: any) {
    return this.portal.misCotizaciones(req.user.sub);
  }
}
