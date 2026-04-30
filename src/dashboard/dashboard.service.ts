import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZonasFrancasService } from '../zonas-francas/zonas-francas.service';
import { LeadsService } from '../leads/leads.service';
import { EstadoOperacion } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private zfService: ZonasFrancasService,
    private leadsService: LeadsService,
  ) {}

  async getResumen() {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

    const [
      operacionesActivas,
      operacionesMes,
      operacionesConZF,
      operacionesSinZF,
      operacionesConAldia,
      clientesConCrossSell,
      zfResumen,
      leadsNuevas,
    ] = await Promise.all([
      this.prisma.operacion.count({
        where: { estado: { notIn: [EstadoOperacion.CERRADA, EstadoOperacion.ENTREGADA] } },
      }),
      this.prisma.operacion.count({ where: { creadoEn: { gte: inicioMes } } }),
      this.prisma.operacion.count({ where: { zonaFrancaId: { not: null }, creadoEn: { gte: inicioMes } } }),
      this.prisma.operacion.count({ where: { zonaFrancaId: null, creadoEn: { gte: inicioMes } } }),
      Promise.resolve(0), // TransporteAsignado count — se habilita en Sprint 2
      this.prisma.cliente.count({ where: { operaciones: { some: { zonaFrancaId: { not: null } } } } }),
      this.zfService.resumenDashboard(),
      this.leadsService.contarNuevas(),
    ]);

    // Revenue estimado de cross-sell (ZF + transporte en mismo mes)
    const revenueEstimadoCrossSell = operacionesConZF * 2500; // USD promedio por operación con ZF

    return {
      operaciones: {
        activas: operacionesActivas,
        mes: operacionesMes,
        conZF: operacionesConZF,
        sinZF: operacionesSinZF,
        conAldia: operacionesConAldia,
      },
      zonasFrancas: zfResumen,
      crm: {
        clientesConCrossSell,
      },
      revenue: {
        estimadoCrossSellUSD: revenueEstimadoCrossSell,
      },
      leads: {
        nuevas: leadsNuevas,
      },
    };
  }
}
