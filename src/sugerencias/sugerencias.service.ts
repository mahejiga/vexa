import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ZonasFrancasService } from '../zonas-francas/zonas-francas.service';
import { PuertoEntrada } from '@prisma/client';

@Injectable()
export class SugerenciasService {
  constructor(
    private prisma: PrismaService,
    private zfService: ZonasFrancasService,
  ) {}

  async generarParaOperacion(operacionId: string) {
    const op = await this.prisma.operacion.findUnique({
      where: { id: operacionId },
      include: { cliente: true },
    });
    if (!op) return [];

    // Limpiar sugerencias anteriores no aceptadas
    await this.prisma.sugerencia.deleteMany({
      where: { operacionId, aceptada: null },
    });

    const sugerencias: any[] = [];

    // ── SUGERENCIA 1: Zona Franca ─────────────────────────────────────────────
    if (op.puertoEntrada !== PuertoEntrada.OTRO) {
      const m2Estimados = op.tipoContenedor === 'CONT_40' || op.tipoContenedor === 'CONT_40HC'
        ? 60 : op.tipoContenedor === 'CONT_20' ? 30 : 20;

      const zf = await this.zfService.findMasCercana(op.puertoEntrada, m2Estimados);

      if (zf) {
        const diasEstimados = 15;
        const costoEstimado = zf.precioPorDiaUSD * diasEstimados;
        const disponibleM2 = zf.capacidadTotalM2 - zf.ocupacionActualM2;

        sugerencias.push({
          operacionId,
          tipo: 'ZONA_FRANCA',
          titulo: `${zf.nombre} · ${zf.ciudad}`,
          descripcion: `${zf.distanciaAlPuertoKm} km del puerto · ${Math.round(disponibleM2)} m² disponibles · $${zf.precioPorDiaUSD} USD/día`,
          valorUSD: costoEstimado,
        });
      }
    }

    // ── SUGERENCIA 2: Transporte Aldia ────────────────────────────────────────
    const tarifasReferencia: Record<string, number> = {
      'CTG-BOG': 4200000,
      'CTG-MED': 3800000,
      'CTG-CAL': 4500000,
      'SMR-BOG': 3900000,
      'SMR-MED': 4100000,
      'BOG-MED': 2800000,
    };

    const destino = op.destinoFinal.toLowerCase();
    let ciudadDestino = 'BOG';
    if (destino.includes('bogot') || destino.includes('cundinam')) ciudadDestino = 'BOG';
    else if (destino.includes('medell') || destino.includes('antioq')) ciudadDestino = 'MED';
    else if (destino.includes('cali') || destino.includes('valle')) ciudadDestino = 'CAL';

    const rutaKey = `${op.puertoEntrada}-${ciudadDestino}`;
    const tarifaTransporte = tarifasReferencia[rutaKey] ?? 4000000;

    sugerencias.push({
      operacionId,
      tipo: 'TRANSPORTE',
      titulo: `Aldia Logística · ${op.puertoEntrada} → ${ciudadDestino}`,
      descripcion: `Disponible para ETA + 2 días · Tracto ${op.tipoContenedor === 'CONT_40' || op.tipoContenedor === 'CONT_40HC' ? '40\'' : '20\''} · ~18h estimado`,
      valorUSD: tarifaTransporte / 4200, // COP a USD aproximado
    });

    // Guardar en BD
    await this.prisma.sugerencia.createMany({ data: sugerencias });

    return this.prisma.sugerencia.findMany({
      where: { operacionId },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async aceptar(sugerenciaId: string) {
    return this.prisma.sugerencia.update({
      where: { id: sugerenciaId },
      data: { aceptada: true },
    });
  }

  async rechazar(sugerenciaId: string) {
    return this.prisma.sugerencia.update({
      where: { id: sugerenciaId },
      data: { aceptada: false },
    });
  }
}
