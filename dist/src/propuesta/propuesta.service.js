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
exports.PropuestaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const propuesta_template_1 = require("./propuesta.template");
let PropuestaService = class PropuestaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generarPdf(operacionId) {
        const op = await this.prisma.operacion.findUnique({
            where: { id: operacionId },
            include: {
                cliente: true,
                zonaFranca: true,
                sugerencias: true,
                cotizaciones: { orderBy: { creadoEn: 'desc' }, take: 1 },
                transporte: true,
                creador: true,
            },
        });
        if (!op)
            throw new common_1.NotFoundException('Operación no encontrada');
        const TRM = 4_250;
        const cotNav = op.cotizaciones?.[0];
        const transporte = op.transporte;
        const navieraTarifaUSD = cotNav?.tarifaUSD ?? 0;
        const zonaFrancaDias = 15;
        const zonaFrancaTotalUSD = op.zonaFranca
            ? op.zonaFranca.precioPorDiaUSD * zonaFrancaDias
            : 0;
        const transportePrecioUSD = transporte?.precioOfertado
            ? transporte.precioOfertado / TRM
            : 0;
        const totalUSD = navieraTarifaUSD + zonaFrancaTotalUSD + transportePrecioUSD;
        const numeroCotizacion = `VX-${op.codigo}-${new Date().getFullYear()}`;
        const hoy = new Date();
        const validaHasta = new Date(hoy);
        validaHasta.setDate(validaHasta.getDate() + 15);
        const fmt = (d) => d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
        const data = {
            numeroCotizacion,
            fecha: fmt(hoy),
            validaHasta: fmt(validaHasta),
            clienteNombre: op.cliente?.razonSocial ?? '—',
            clienteNit: op.cliente?.nit ?? undefined,
            clienteContacto: op.cliente?.contactoPrincipal ?? undefined,
            clienteEmail: op.cliente?.email ?? undefined,
            operacionCodigo: op.codigo,
            tipo: op.tipo,
            paisOrigen: op.paisOrigen,
            puertoEntrada: op.puertoEntrada,
            tipoContenedor: op.tipoContenedor,
            descripcionCarga: op.descripcionCarga,
            pesoTon: op.pesoTon ?? 0,
            destinoFinal: op.destinoFinal ?? '—',
            etaPuerto: op.etaPuerto
                ? new Date(op.etaPuerto).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
                : 'Por confirmar',
            navieraNombre: cotNav?.naviera ?? op.navieraActual ?? undefined,
            navieraTarifaUSD: navieraTarifaUSD || undefined,
            navieraTiempoTransito: cotNav?.tiempoTransitoD ?? undefined,
            navieraDisponibilidad: cotNav?.disponibilidad ?? undefined,
            zonaFrancaNombre: op.zonaFranca?.nombre ?? undefined,
            zonaFrancaCiudad: op.zonaFranca?.ciudad ?? undefined,
            zonaFrancaDias: zonaFrancaDias,
            zonaFrancaPrecioDiaUSD: op.zonaFranca?.precioPorDiaUSD ?? undefined,
            zonaFrancaTotalUSD: zonaFrancaTotalUSD || undefined,
            transporteCarrier: transporte?.carrier ?? undefined,
            transporteRuta: transporte ? `${transporte.origen} → ${transporte.destino}` : undefined,
            transportePrecioCOP: transporte?.precioOfertado ?? undefined,
            transportePrecioUSD: transportePrecioUSD || undefined,
            trmDelDia: TRM,
            subtotalNavieraUSD: navieraTarifaUSD,
            subtotalZFUSD: zonaFrancaTotalUSD,
            subtotalTransporteUSD: transportePrecioUSD,
            totalUSD,
            totalCOP: totalUSD * TRM,
        };
        const html = (0, propuesta_template_1.generarHtmlPropuesta)(data);
        const puppeteer = await import('puppeteer');
        const browser = await puppeteer.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' },
        });
        await browser.close();
        return Buffer.from(pdf);
    }
};
exports.PropuestaService = PropuestaService;
exports.PropuestaService = PropuestaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropuestaService);
//# sourceMappingURL=propuesta.service.js.map