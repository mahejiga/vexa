import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { OperacionesModule } from './operaciones/operaciones.module';
import { ZonasFrancasModule } from './zonas-francas/zonas-francas.module';
import { SugerenciasModule } from './sugerencias/sugerencias.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PropuestaModule } from './propuesta/propuesta.module';
import { CotizadorPublicoModule } from './cotizador-publico/cotizador-publico.module';
import { DocumentosModule } from './documentos/documentos.module';
import { LeadsModule } from './leads/leads.module';
import { PortalModule } from './portal/portal.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ClientesModule,
    OperacionesModule,
    ZonasFrancasModule,
    SugerenciasModule,
    DashboardModule,
    PropuestaModule,
    CotizadorPublicoModule,
    DocumentosModule,
    LeadsModule,
    PortalModule,
  ],
})
export class AppModule {}
