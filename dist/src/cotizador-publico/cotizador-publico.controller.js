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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CotizadorPublicoController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CotizadorPublicoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const maersk_service_1 = require("./carriers/maersk.service");
const hapag_lloyd_service_1 = require("./carriers/hapag-lloyd.service");
const cma_cgm_service_1 = require("./carriers/cma-cgm.service");
const rate_cache_service_1 = require("./carriers/rate-cache.service");
const carrier_interface_1 = require("./carriers/carrier.interface");
const prisma_service_1 = require("../prisma/prisma.service");
const ESTIMATED_CARRIERS = [
    { name: 'Evergreen', index: 3 },
    { name: 'Hamburg Süd', index: 4 },
    { name: 'MSC', index: 5 },
];
function generarNumeroCotizacion() {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `VX-${year}-${rand}`;
}
let CotizadorPublicoController = CotizadorPublicoController_1 = class CotizadorPublicoController {
    maersk;
    hapag;
    cma;
    rateCache;
    prisma;
    logger = new common_1.Logger(CotizadorPublicoController_1.name);
    constructor(maersk, hapag, cma, rateCache, prisma) {
        this.maersk = maersk;
        this.hapag = hapag;
        this.cma = cma;
        this.rateCache = rateCache;
        this.prisma = prisma;
    }
    async buscarCliente(email) {
        if (!email)
            return null;
        const cliente = await this.prisma.cliente.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
            select: {
                id: true,
                razonSocial: true,
                contactoPrincipal: true,
                email: true,
                telefono: true,
                ciudad: true,
                nit: true,
                cotizaciones: {
                    orderBy: { creadoEn: 'desc' },
                    take: 5,
                    select: {
                        numeroCotizacion: true,
                        naviera: true,
                        tarifaUSD: true,
                        tipoContenedor: true,
                        puertoOrigen: true,
                        creadoEn: true,
                        rawResponse: true,
                    },
                },
            },
        });
        return cliente;
    }
    async consultar(body) {
        const { origen, destino, tipoCarga, empresa, contacto, email, telefono, tipoMercancia, descripcionCarga } = body;
        const originCode = carrier_interface_1.UNLOCODE[origen] ?? origen;
        const destCode = carrier_interface_1.UNLOCODE[destino] ?? destino;
        const cacheKey = this.rateCache.key(originCode, destCode, tipoCarga);
        const numeroCotizacion = generarNumeroCotizacion();
        if (empresa || email) {
            this.logger.log(`LEAD ${numeroCotizacion}: ${empresa ?? 'n/a'} | ${email ?? 'n/a'} | ${origen}→${destino} ${tipoCarga}`);
        }
        const cached = this.rateCache.get(cacheKey);
        if (cached && !empresa) {
            return { ok: true, tarifas: cached, numeroCotizacion, consultadoEn: new Date().toISOString(), fuente: 'cache' };
        }
        const query = { originUNLOCODE: originCode, destUNLOCODE: destCode, containerCode: tipoCarga };
        const [maerskResult, hapagResult, cmaResult] = await Promise.allSettled([
            this.maersk.getRate(query),
            this.hapag.getRate(query),
            this.cma.getRate(query),
        ]);
        const apiRates = [
            maerskResult.status === 'fulfilled' ? maerskResult.value : (0, carrier_interface_1.estimatedRate)('Maersk', originCode, tipoCarga, 0),
            hapagResult.status === 'fulfilled' ? hapagResult.value : (0, carrier_interface_1.estimatedRate)('Hapag-Lloyd', originCode, tipoCarga, 1),
            cmaResult.status === 'fulfilled' ? cmaResult.value : (0, carrier_interface_1.estimatedRate)('CMA CGM', originCode, tipoCarga, 2),
        ];
        const estimatedRates = ESTIMATED_CARRIERS.map(c => (0, carrier_interface_1.estimatedRate)(c.name, originCode, tipoCarga, c.index));
        const tarifas = [...apiRates, ...estimatedRates].sort((a, b) => a.tarifaUSD - b.tarifaUSD);
        this.rateCache.set(cacheKey, tarifas);
        if (empresa || email) {
            try {
                let cliente = email
                    ? await this.prisma.cliente.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
                    : null;
                if (!cliente) {
                    cliente = await this.prisma.cliente.create({
                        data: {
                            razonSocial: empresa ?? contacto ?? 'Lead sin nombre',
                            email: email ?? undefined,
                            telefono: telefono ?? undefined,
                            contactoPrincipal: contacto ?? undefined,
                            activo: true,
                        },
                    });
                    this.logger.log(`Nuevo cliente: ${cliente.id} — ${cliente.razonSocial}`);
                }
                else {
                    await this.prisma.cliente.update({
                        where: { id: cliente.id },
                        data: {
                            ...(empresa && { razonSocial: empresa }),
                            ...(telefono && { telefono }),
                            ...(contacto && { contactoPrincipal: contacto }),
                        },
                    });
                }
                await Promise.all(tarifas.map((t) => this.prisma.cotizacionNaviera.create({
                    data: {
                        numeroCotizacion,
                        clienteId: cliente.id,
                        naviera: t.naviera,
                        puertoOrigen: originCode,
                        puertoDestino: destCode,
                        tipoContenedor: tipoCarga,
                        tarifaUSD: t.tarifaUSD,
                        tiempoTransitoD: t.tiempoTransitoD,
                        disponibilidad: t.disponibilidad,
                        fuente: t.fuente,
                        validaHasta: new Date(Date.now() + 48 * 60 * 60 * 1000),
                        rawResponse: {
                            tipoMercancia: tipoMercancia ?? null,
                            descripcionCarga: descripcionCarga ?? null,
                        },
                    },
                })));
            }
            catch (err) {
                this.logger.error(`Error guardando lead: ${err.message}`);
            }
        }
        return { ok: true, tarifas, numeroCotizacion, consultadoEn: new Date().toISOString() };
    }
};
exports.CotizadorPublicoController = CotizadorPublicoController;
__decorate([
    (0, common_1.Get)('cliente'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CotizadorPublicoController.prototype, "buscarCliente", null);
__decorate([
    (0, common_1.Post)('consultar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CotizadorPublicoController.prototype, "consultar", null);
exports.CotizadorPublicoController = CotizadorPublicoController = CotizadorPublicoController_1 = __decorate([
    (0, swagger_1.ApiTags)('Cotizador Público'),
    (0, common_1.Controller)('cotizador-publico'),
    __metadata("design:paramtypes", [maersk_service_1.MaerskService,
        hapag_lloyd_service_1.HapagLloydService,
        cma_cgm_service_1.CmaCgmService,
        rate_cache_service_1.RateCacheService,
        prisma_service_1.PrismaService])
], CotizadorPublicoController);
//# sourceMappingURL=cotizador-publico.controller.js.map