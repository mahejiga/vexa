import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PuertoEntrada } from '@prisma/client';

@Injectable()
export class ZonasFrancasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const zonas = await this.prisma.zonaFranca.findMany({
      where: { activa: true },
      include: {
        _count: { select: { cargas: true, operaciones: true } },
        cargas: {
          where: { fechaSalidaEstimada: { gte: new Date() } },
          orderBy: { fechaEntrada: 'desc' },
        },
      },
    });

    return zonas.map((z) => ({
      ...z,
      disponibleM2: z.capacidadTotalM2 - z.ocupacionActualM2,
      ocupacionPct: Math.round((z.ocupacionActualM2 / z.capacidadTotalM2) * 100),
    }));
  }

  async findMasCercana(puerto: PuertoEntrada, m2Requeridos = 100) {
    const puertoCiudad: Record<PuertoEntrada, string> = {
      CTG: 'Cartagena',
      SMR: 'Santa Marta',
      BOG: 'Bogotá',
      OTRO: '',
    };

    const zonas = await this.prisma.zonaFranca.findMany({
      where: {
        activa: true,
        ciudad: puertoCiudad[puerto] || undefined,
      },
      orderBy: { distanciaAlPuertoKm: 'asc' },
    });

    return zonas.find((z) => z.capacidadTotalM2 - z.ocupacionActualM2 >= m2Requeridos) ?? zonas[0] ?? null;
  }

  async actualizarOcupacion(id: string, ocupacionActualM2: number) {
    return this.prisma.zonaFranca.update({
      where: { id },
      data: { ocupacionActualM2, ultimaSincronizacion: new Date() },
    });
  }

  async resumenDashboard() {
    const zonas = await this.findAll();
    const totalCapacidad = zonas.reduce((a, z) => a + z.capacidadTotalM2, 0);
    const totalOcupado = zonas.reduce((a, z) => a + z.ocupacionActualM2, 0);

    return {
      zonas,
      totalCapacidadM2: totalCapacidad,
      totalOcupadoM2: totalOcupado,
      totalDisponibleM2: totalCapacidad - totalOcupado,
      ocupacionGlobalPct: Math.round((totalOcupado / totalCapacidad) * 100),
    };
  }
}
