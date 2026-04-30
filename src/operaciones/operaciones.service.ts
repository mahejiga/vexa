import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoOperacion, PuertoEntrada, TipoContenedor, TipoOperacion } from '@prisma/client';
import { MaerskService }     from '../cotizador-publico/carriers/maersk.service';
import { HapagLloydService } from '../cotizador-publico/carriers/hapag-lloyd.service';
import { CmaCgmService }     from '../cotizador-publico/carriers/cma-cgm.service';
import { estimatedRate, UNLOCODE } from '../cotizador-publico/carriers/carrier.interface';

// Carriers adicionales estimados
const EXTRA_CARRIERS = [
  { name: 'MSC',          index: 3 },
  { name: 'Evergreen',    index: 4 },
  { name: 'Hamburg Süd',  index: 5 },
];

@Injectable()
export class OperacionesService {
  constructor(
    private prisma: PrismaService,
    private maersk: MaerskService,
    private hapag:  HapagLloydService,
    private cma:    CmaCgmService,
  ) {}

  private generarCodigo(): string {
    const n = Math.floor(1000 + Math.random() * 9000);
    return `FF-${n}`;
  }

  // Mapeo puerto VEXA → UNLOCODE
  private puertoUNLOCODE(puerto: string): string {
    const map: Record<string, string> = {
      CTG: 'COCTG',
      SMR: 'COSMR',
      BOG: 'COBOG',
      OTRO: 'COCTG',
    };
    return map[puerto] ?? 'COCTG';
  }

  async findAll(filtros?: {
    estado?: EstadoOperacion;
    clienteId?: string;
    puertoEntrada?: PuertoEntrada;
    busqueda?: string;
  }) {
    return this.prisma.operacion.findMany({
      where: {
        ...(filtros?.estado && { estado: filtros.estado }),
        ...(filtros?.clienteId && { clienteId: filtros.clienteId }),
        ...(filtros?.puertoEntrada && { puertoEntrada: filtros.puertoEntrada }),
        ...(filtros?.busqueda && {
          OR: [
            { codigo: { contains: filtros.busqueda, mode: 'insensitive' } },
            { descripcionCarga: { contains: filtros.busqueda, mode: 'insensitive' } },
            { cliente: { razonSocial: { contains: filtros.busqueda, mode: 'insensitive' } } },
          ],
        }),
      },
      include: {
        cliente: { select: { id: true, razonSocial: true, nit: true } },
        zonaFranca: { select: { id: true, nombre: true, ciudad: true } },
        sugerencias: { where: { aceptada: null }, take: 5 },
        creador: { select: { id: true, nombre: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string) {
    const op = await this.prisma.operacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        zonaFranca: true,
        transporte: true,
        cotizaciones: { orderBy: { tarifaUSD: 'asc' } },
        sugerencias: { orderBy: { creadoEn: 'desc' } },
        documentos: { orderBy: { creadoEn: 'desc' } },
        logs: { orderBy: { creadoEn: 'desc' }, take: 20 },
        creador: { select: { id: true, nombre: true } },
      },
    });
    if (!op) throw new NotFoundException('Operación no encontrada');
    return op;
  }

  async create(data: {
    clienteId: string;
    tipo: TipoOperacion;
    paisOrigen: string;
    paisDestino?: string;
    puertoEntrada: PuertoEntrada;
    tipoContenedor: TipoContenedor;
    descripcionCarga: string;
    pesoTon: number;
    destinoFinal: string;
    etaPuerto: Date;
    numeroBlAwb?: string;
    navieraActual?: string;
    valorFobUSD?: number;
    notasInternas?: string;
    creadoPor: string;
  }) {
    let codigo = this.generarCodigo();
    while (await this.prisma.operacion.findUnique({ where: { codigo } })) {
      codigo = this.generarCodigo();
    }

    const operacion = await this.prisma.operacion.create({
      data: { ...data, codigo },
      include: { cliente: true, zonaFranca: true },
    });

    await this.prisma.logAuditoria.create({
      data: {
        usuarioId: data.creadoPor,
        operacionId: operacion.id,
        accion: 'OPERACION_CREADA',
        detalle: { codigo: operacion.codigo },
      },
    });

    return operacion;
  }

  async cambiarEstado(id: string, estado: EstadoOperacion, usuarioId: string) {
    const op = await this.findOne(id);

    const actualizado = await this.prisma.operacion.update({
      where: { id },
      data: { estado },
    });

    await this.prisma.logAuditoria.create({
      data: {
        usuarioId,
        operacionId: id,
        accion: 'ESTADO_CAMBIADO',
        detalle: { de: op.estado, a: estado },
      },
    });

    return actualizado;
  }

  async update(id: string, data: any, usuarioId: string) {
    await this.findOne(id);
    const actualizado = await this.prisma.operacion.update({ where: { id }, data });

    await this.prisma.logAuditoria.create({
      data: { usuarioId, operacionId: id, accion: 'OPERACION_ACTUALIZADA', detalle: data },
    });

    return actualizado;
  }

  async asignarZonaFranca(operacionId: string, zonaFrancaId: string, usuarioId: string) {
    await this.findOne(operacionId);

    const actualizado = await this.prisma.operacion.update({
      where: { id: operacionId },
      data: { zonaFrancaId, estado: EstadoOperacion.EN_ZONA_FRANCA },
    });

    await this.prisma.logAuditoria.create({
      data: { usuarioId, operacionId, accion: 'ZF_ASIGNADA', detalle: { zonaFrancaId } },
    });

    return actualizado;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // COTIZACIÓN NAVIERAS
  // ──────────────────────────────────────────────────────────────────────────

  async cotizarNavieras(operacionId: string, usuarioId: string, origenOverride?: string) {
    const op = await this.findOne(operacionId);

    // Determinar origen: usar override (país de origen) o detectar
    const destUNLOCODE = this.puertoUNLOCODE(op.puertoEntrada);
    const origenCode   = origenOverride ?? UNLOCODE['CNSHA']; // default China Shanghai

    const query = {
      originUNLOCODE: origenCode,
      destUNLOCODE,
      containerCode: op.tipoContenedor,
    };

    // Consultar las 3 navieras con API real + fallback estimado
    const [maerskRes, hapagRes, cmaRes] = await Promise.allSettled([
      this.maersk.getRate(query),
      this.hapag.getRate(query),
      this.cma.getRate(query),
    ]);

    const apiRates = [
      maerskRes.status === 'fulfilled' ? maerskRes.value : estimatedRate('Maersk',      origenCode, op.tipoContenedor, 0),
      hapagRes.status  === 'fulfilled' ? hapagRes.value  : estimatedRate('Hapag-Lloyd', origenCode, op.tipoContenedor, 1),
      cmaRes.status    === 'fulfilled' ? cmaRes.value    : estimatedRate('CMA CGM',     origenCode, op.tipoContenedor, 2),
    ];

    const extraRates = EXTRA_CARRIERS.map(c =>
      estimatedRate(c.name, origenCode, op.tipoContenedor, c.index),
    );

    const todasLasTarifas = [...apiRates, ...extraRates].sort((a, b) => a.tarifaUSD - b.tarifaUSD);

    // Borrar cotizaciones previas no seleccionadas
    await this.prisma.cotizacionNaviera.deleteMany({
      where: { operacionId, seleccionada: false },
    });

    // Guardar todas en BD
    const guardadas = await Promise.all(
      todasLasTarifas.map((tarifa) =>
        this.prisma.cotizacionNaviera.create({
          data: {
            operacionId,
            naviera:        tarifa.naviera,
            puertoOrigen:   origenCode,
            puertoDestino:  destUNLOCODE,
            tipoContenedor: op.tipoContenedor,
            tarifaUSD:      tarifa.tarifaUSD,
            tiempoTransitoD: tarifa.tiempoTransitoD,
            disponibilidad: tarifa.disponibilidad,
            fuente:         tarifa.fuente,
            seleccionada:   false,
            validaHasta:    new Date(Date.now() + 48 * 60 * 60 * 1000),
          },
        }),
      ),
    );

    await this.prisma.logAuditoria.create({
      data: {
        usuarioId,
        operacionId,
        accion: 'COTIZACION_NAVIERAS',
        detalle: { total: guardadas.length, origen: origenCode, destino: destUNLOCODE },
      },
    });

    return guardadas;
  }

  async seleccionarCotizacion(operacionId: string, cotizacionId: string, usuarioId: string) {
    // Desmarcar todas
    await this.prisma.cotizacionNaviera.updateMany({
      where: { operacionId },
      data: { seleccionada: false },
    });

    // Marcar la elegida
    const cotizacion = await this.prisma.cotizacionNaviera.update({
      where: { id: cotizacionId },
      data: { seleccionada: true },
    });

    // Actualizar naviera en la operación
    await this.prisma.operacion.update({
      where: { id: operacionId },
      data: { navieraActual: cotizacion.naviera },
    });

    await this.prisma.logAuditoria.create({
      data: {
        usuarioId,
        operacionId,
        accion: 'NAVIERA_SELECCIONADA',
        detalle: { naviera: cotizacion.naviera, tarifaUSD: cotizacion.tarifaUSD },
      },
    });

    return cotizacion;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STATS
  // ──────────────────────────────────────────────────────────────────────────

  async stats() {
    const [total, activas, entregadas, enZF] = await Promise.all([
      this.prisma.operacion.count(),
      this.prisma.operacion.count({
        where: { estado: { notIn: [EstadoOperacion.CERRADA, EstadoOperacion.ENTREGADA] } },
      }),
      this.prisma.operacion.count({ where: { estado: EstadoOperacion.ENTREGADA } }),
      this.prisma.operacion.count({ where: { estado: EstadoOperacion.EN_ZONA_FRANCA } }),
    ]);

    return { total, activas, entregadas, enZF };
  }
}
