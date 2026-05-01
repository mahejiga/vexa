import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

const ESTADO_LABEL: Record<string, string> = {
  BORRADOR:            'Cotización recibida',
  CONFIRMADA:          'Operación confirmada',
  EN_TRANSITO_ORIGEN:  'En tránsito — origen',
  EN_PUERTO:           'En puerto de entrada',
  EN_ZONA_FRANCA:      'En zona franca',
  EN_TRANSITO_DESTINO: 'En tránsito — destino',
  ENTREGADA:           'Entregada',
  CERRADA:             'Cerrada',
};

const ESTADO_ORDEN = [
  'BORRADOR','CONFIRMADA','EN_TRANSITO_ORIGEN',
  'EN_PUERTO','EN_ZONA_FRANCA','EN_TRANSITO_DESTINO','ENTREGADA','CERRADA',
];

@Injectable()
export class PortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt:    JwtService,
  ) {}

  async autenticar(email: string, numeroCotizacion: string) {
    const cot = await this.prisma.cotizacionNaviera.findFirst({
      where: {
        numeroCotizacion,
        cliente: { email: { equals: email, mode: 'insensitive' } },
      },
      include: { cliente: true },
    });

    if (!cot?.cliente) {
      throw new UnauthorizedException('Email o número de cotización incorrectos');
    }

    const token = this.jwt.sign(
      { sub: cot.cliente.id, tipo: 'portal' },
      { expiresIn: '7d' },
    );

    return {
      ok:             true,
      token,
      clienteNombre:  cot.cliente.razonSocial,
      clienteId:      cot.cliente.id,
    };
  }

  async misOperaciones(clienteId: string) {
    const operaciones = await this.prisma.operacion.findMany({
      where: { clienteId },
      include: {
        zonaFranca:  true,
        transporte:  true,
        documentos:  { select: { id: true, tipo: true, nombre: true, creadoEn: true } },
        cotizaciones: {
          where: { seleccionada: true },
          take: 1,
          select: { naviera: true, tarifaUSD: true, tiempoTransitoD: true },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });

    return operaciones.map(op => ({
      id:              op.id,
      codigo:          op.codigo,
      tipo:            op.tipo,
      paisOrigen:      op.paisOrigen,
      puertoEntrada:   op.puertoEntrada,
      tipoContenedor:  op.tipoContenedor,
      descripcionCarga: op.descripcionCarga,
      destinoFinal:    op.destinoFinal,
      etaPuerto:       op.etaPuerto,
      naviera:         op.cotizaciones[0]?.naviera ?? op.navieraActual,
      tarifaUSD:       op.cotizaciones[0]?.tarifaUSD,
      estado:          op.estado,
      estadoLabel:     ESTADO_LABEL[op.estado] ?? op.estado,
      progreso:        Math.round((ESTADO_ORDEN.indexOf(op.estado) / (ESTADO_ORDEN.length - 1)) * 100),
      zonaFranca:      op.zonaFranca ? { nombre: op.zonaFranca.nombre, ciudad: op.zonaFranca.ciudad } : null,
      documentos:      op.documentos.length,
      creadoEn:        op.creadoEn,
    }));
  }

  async misCotizaciones(clienteId: string) {
    const all = await this.prisma.cotizacionNaviera.findMany({
      where: { clienteId, numeroCotizacion: { not: null } },
      orderBy: { creadoEn: 'desc' },
    });

    const map = new Map<string, { numeroCotizacion: string; puertoOrigen: string; puertoDestino: string; tipoContenedor: string; creadoEn: Date; mejorTarifa: number | null; navieras: number }>();
    for (const r of all) {
      if (!r.numeroCotizacion) continue;
      if (!map.has(r.numeroCotizacion)) {
        map.set(r.numeroCotizacion, {
          numeroCotizacion: r.numeroCotizacion,
          puertoOrigen:     r.puertoOrigen,
          puertoDestino:    r.puertoDestino,
          tipoContenedor:   r.tipoContenedor,
          creadoEn:         r.creadoEn,
          mejorTarifa:      null,
          navieras:         0,
        });
      }
      const g = map.get(r.numeroCotizacion)!;
      g.navieras++;
      if (r.tarifaUSD !== null && (g.mejorTarifa === null || r.tarifaUSD < g.mejorTarifa)) {
        g.mejorTarifa = r.tarifaUSD;
      }
    }

    return Array.from(map.values());
  }
}
