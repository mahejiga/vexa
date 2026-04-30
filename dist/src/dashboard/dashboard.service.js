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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const zonas_francas_service_1 = require("../zonas-francas/zonas-francas.service");
const leads_service_1 = require("../leads/leads.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    zfService;
    leadsService;
    constructor(prisma, zfService, leadsService) {
        this.prisma = prisma;
        this.zfService = zfService;
        this.leadsService = leadsService;
    }
    async getResumen() {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const [operacionesActivas, operacionesMes, operacionesConZF, operacionesSinZF, operacionesConAldia, clientesConCrossSell, zfResumen, leadsNuevas,] = await Promise.all([
            this.prisma.operacion.count({
                where: { estado: { notIn: [client_1.EstadoOperacion.CERRADA, client_1.EstadoOperacion.ENTREGADA] } },
            }),
            this.prisma.operacion.count({ where: { creadoEn: { gte: inicioMes } } }),
            this.prisma.operacion.count({ where: { zonaFrancaId: { not: null }, creadoEn: { gte: inicioMes } } }),
            this.prisma.operacion.count({ where: { zonaFrancaId: null, creadoEn: { gte: inicioMes } } }),
            Promise.resolve(0),
            this.prisma.cliente.count({ where: { operaciones: { some: { zonaFrancaId: { not: null } } } } }),
            this.zfService.resumenDashboard(),
            this.leadsService.contarNuevas(),
        ]);
        const revenueEstimadoCrossSell = operacionesConZF * 2500;
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        zonas_francas_service_1.ZonasFrancasService,
        leads_service_1.LeadsService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map