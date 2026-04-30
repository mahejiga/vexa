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
exports.SugerenciasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const zonas_francas_service_1 = require("../zonas-francas/zonas-francas.service");
const client_1 = require("@prisma/client");
let SugerenciasService = class SugerenciasService {
    prisma;
    zfService;
    constructor(prisma, zfService) {
        this.prisma = prisma;
        this.zfService = zfService;
    }
    async generarParaOperacion(operacionId) {
        const op = await this.prisma.operacion.findUnique({
            where: { id: operacionId },
            include: { cliente: true },
        });
        if (!op)
            return [];
        await this.prisma.sugerencia.deleteMany({
            where: { operacionId, aceptada: null },
        });
        const sugerencias = [];
        if (op.puertoEntrada !== client_1.PuertoEntrada.OTRO) {
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
        const tarifasReferencia = {
            'CTG-BOG': 4200000,
            'CTG-MED': 3800000,
            'CTG-CAL': 4500000,
            'SMR-BOG': 3900000,
            'SMR-MED': 4100000,
            'BOG-MED': 2800000,
        };
        const destino = op.destinoFinal.toLowerCase();
        let ciudadDestino = 'BOG';
        if (destino.includes('bogot') || destino.includes('cundinam'))
            ciudadDestino = 'BOG';
        else if (destino.includes('medell') || destino.includes('antioq'))
            ciudadDestino = 'MED';
        else if (destino.includes('cali') || destino.includes('valle'))
            ciudadDestino = 'CAL';
        const rutaKey = `${op.puertoEntrada}-${ciudadDestino}`;
        const tarifaTransporte = tarifasReferencia[rutaKey] ?? 4000000;
        sugerencias.push({
            operacionId,
            tipo: 'TRANSPORTE',
            titulo: `Aldia Logística · ${op.puertoEntrada} → ${ciudadDestino}`,
            descripcion: `Disponible para ETA + 2 días · Tracto ${op.tipoContenedor === 'CONT_40' || op.tipoContenedor === 'CONT_40HC' ? '40\'' : '20\''} · ~18h estimado`,
            valorUSD: tarifaTransporte / 4200,
        });
        await this.prisma.sugerencia.createMany({ data: sugerencias });
        return this.prisma.sugerencia.findMany({
            where: { operacionId },
            orderBy: { creadoEn: 'desc' },
        });
    }
    async aceptar(sugerenciaId) {
        return this.prisma.sugerencia.update({
            where: { id: sugerenciaId },
            data: { aceptada: true },
        });
    }
    async rechazar(sugerenciaId) {
        return this.prisma.sugerencia.update({
            where: { id: sugerenciaId },
            data: { aceptada: false },
        });
    }
};
exports.SugerenciasService = SugerenciasService;
exports.SugerenciasService = SugerenciasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        zonas_francas_service_1.ZonasFrancasService])
], SugerenciasService);
//# sourceMappingURL=sugerencias.service.js.map