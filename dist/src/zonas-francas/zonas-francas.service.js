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
exports.ZonasFrancasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ZonasFrancasService = class ZonasFrancasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async findMasCercana(puerto, m2Requeridos = 100) {
        const puertoCiudad = {
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
    async actualizarOcupacion(id, ocupacionActualM2) {
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
};
exports.ZonasFrancasService = ZonasFrancasService;
exports.ZonasFrancasService = ZonasFrancasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ZonasFrancasService);
//# sourceMappingURL=zonas-francas.service.js.map