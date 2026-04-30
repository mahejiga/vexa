"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperacionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const maersk_service_1 = require("../cotizador-publico/carriers/maersk.service");
const hapag_lloyd_service_1 = require("../cotizador-publico/carriers/hapag-lloyd.service");
const cma_cgm_service_1 = require("../cotizador-publico/carriers/cma-cgm.service");
const carrier_interface_1 = require("../cotizador-publico/carriers/carrier.interface");
const EXTRA_CARRIERS = [
    { name: 'MSC', index: 3 },
    { name: 'Evergreen', index: 4 },
    { name: 'Hamburg Süd', index: 5 },
];
let OperacionesService = class OperacionesService {
    prisma;
    maersk;
    hapag;
    cma;
    constructor(prisma, maersk, hapag, cma) {
        this.prisma = prisma;
        this.maersk = maersk;
        this.hapag = hapag;
        this.cma = cma;
    }
    generarCodigo() {
        const n = Math.floor(1000 + Math.random() * 9000);
        return `FF-${n}`;
    }
    puertoUNLOCODE(puerto) {
        const map = {
            CTG: 'COCTG',
            SMR: 'COSMR',
            BOG: 'COBOG',
            OTRO: 'COCTG',
        };
        return map[puerto] ?? 'COCTG';
    }
    async findAll(filtros) {
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
    async findOne(id) {
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
        if (!op)
            throw new common_1.NotFoundException('Operación no encontrada');
        return op;
    }
    async create(data) {
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
    async cambiarEstado(id, estado, usuarioId) {
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
    async update(id, data, usuarioId) {
        await this.findOne(id);
        const actualizado = await this.prisma.operacion.update({ where: { id }, data });
        await this.prisma.logAuditoria.create({
            data: { usuarioId, operacionId: id, accion: 'OPERACION_ACTUALIZADA', detalle: data },
        });
        return actualizado;
    }
    async asignarZonaFranca(operacionId, zonaFrancaId, usuarioId) {
        await this.findOne(operacionId);
        const actualizado = await this.prisma.operacion.update({
            where: { id: operacionId },
            data: { zonaFrancaId, estado: client_1.EstadoOperacion.EN_ZONA_FRANCA },
        });
        await this.prisma.logAuditoria.create({
            data: { usuarioId, operacionId, accion: 'ZF_ASIGNADA', detalle: { zonaFrancaId } },
        });
        return actualizado;
    }
    async cotizarNavieras(operacionId, usuarioId, origenOverride) {
        const op = await this.findOne(operacionId);
        const destUNLOCODE = this.puertoUNLOCODE(op.puertoEntrada);
        const origenCode = origenOverride ?? carrier_interface_1.UNLOCODE['CNSHA'];
        const query = {
            originUNLOCODE: origenCode,
            destUNLOCODE,
            containerCode: op.tipoContenedor,
        };
        const [maerskRes, hapagRes, cmaRes] = await Promise.allSettled([
            this.maersk.getRate(query),
            this.hapag.getRate(query),
            this.cma.getRate(query),
        ]);
        const apiRates = [
            maerskRes.status === 'fulfilled' ? maerskRes.value : (0, carrier_interface_1.estimatedRate)('Maersk', origenCode, op.tipoContenedor, 0),
            hapagRes.status === 'fulfilled' ? hapagRes.value : (0, carrier_interface_1.estimatedRate)('Hapag-Lloyd', origenCode, op.tipoContenedor, 1),
            cmaRes.status === 'fulfilled' ? cmaRes.value : (0, carrier_interface_1.estimatedRate)('CMA CGM', origenCode, op.tipoContenedor, 2),
        ];
        const extraRates = EXTRA_CARRIERS.map(c => (0, carrier_interface_1.estimatedRate)(c.name, origenCode, op.tipoContenedor, c.index));
        const todasLasTarifas = [...apiRates, ...extraRates].sort((a, b) => a.tarifaUSD - b.tarifaUSD);
        await this.prisma.cotizacionNaviera.deleteMany({
            where: { operacionId, seleccionada: false },
        });
        const guardadas = await Promise.all(todasLasTarifas.map((tarifa) => this.prisma.cotizacionNaviera.create({
            data: {
                operacionId,
                naviera: tarifa.naviera,
                puertoOrigen: origenCode,
                puertoDestino: destUNLOCODE,
                tipoContenedor: op.tipoContenedor,
                tarifaUSD: tarifa.tarifaUSD,
                tiempoTransitoD: tarifa.tiempoTransitoD,
                disponibilidad: tarifa.disponibilidad,
                fuente: tarifa.fuente,
                seleccionada: false,
                validaHasta: new Date(Date.now() + 48 * 60 * 60 * 1000),
            },
        })));
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
    async seleccionarCotizacion(operacionId, cotizacionId, usuarioId) {
        await this.prisma.cotizacionNaviera.updateMany({
            where: { operacionId },
            data: { seleccionada: false },
        });
        const cotizacion = await this.prisma.cotizacionNaviera.update({
            where: { id: cotizacionId },
            data: { seleccionada: true },
        });
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
    async stats() {
        const [total, activas, entregadas, enZF] = await Promise.all([
            this.prisma.operacion.count(),
            this.prisma.operacion.count({
                where: { estado: { notIn: [client_1.EstadoOperacion.CERRADA, client_1.EstadoOperacion.ENTREGADA] } },
            }),
            this.prisma.operacion.count({ where: { estado: client_1.EstadoOperacion.ENTREGADA } }),
            this.prisma.operacion.count({ where: { estado: client_1.EstadoOperacion.EN_ZONA_FRANCA } }),
        ]);
        return { total, activas, entregadas, enZF };
    }
};
exports.OperacionesService = OperacionesService;
exports.OperacionesService = OperacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        maersk_service_1.MaerskService,
        hapag_lloyd_service_1.HapagLloydService,
        cma_cgm_service_1.CmaCgmService])
], OperacionesService);
//# sourceMappingURL=operaciones.service.js.map