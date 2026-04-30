"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LeadsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const lead_cotizacion_template_1 = require("./lead-cotizacion.template");
const nodemailer = __importStar(require("nodemailer"));
const UNLOCODE_LABEL = {
    CNSHA: 'Shanghai, China',
    CNNGB: 'Ningbo, China',
    CNQIN: 'Qingdao, China',
    DEHAM: 'Hamburgo, Alemania',
    NLRTM: 'Rotterdam, Países Bajos',
    ESVLC: 'Valencia, España',
    ESBCN: 'Barcelona, España',
    USNYC: 'Nueva York, EE.UU.',
    USHOU: 'Houston, EE.UU.',
    USSAV: 'Savannah, EE.UU.',
    USCHA: 'Charleston, EE.UU.',
    USMIA: 'Miami, EE.UU.',
    USNFK: 'Norfolk, EE.UU.',
    MXZLO: 'Manzanillo, México',
    MXVER: 'Veracruz, México',
    MXLZC: 'Lázaro Cárdenas, México',
    GTSTC: 'Santo Tomás de Castilla, Guatemala',
    COCTG: 'Cartagena, Colombia',
    COSMR: 'Santa Marta, Colombia',
    COBUN: 'Buenaventura, Colombia',
    COBAQ: 'Barranquilla, Colombia',
};
const UNLOCODE_TO_PAIS = {
    CNSHA: 'China', CNNGB: 'China', CNQIN: 'China',
    DEHAM: 'Alemania', NLRTM: 'Países Bajos', ESVLC: 'España', ESBCN: 'España',
    USNYC: 'Estados Unidos', USHOU: 'Estados Unidos', USSAV: 'Estados Unidos',
    USCHA: 'Estados Unidos', USMIA: 'Estados Unidos', USNFK: 'Estados Unidos',
    MXZLO: 'México', MXVER: 'México', MXLZC: 'México',
    GTSTC: 'Guatemala',
};
const UNLOCODE_TO_PUERTO = {
    COCTG: client_1.PuertoEntrada.CTG,
    COSMR: client_1.PuertoEntrada.SMR,
    COBUN: client_1.PuertoEntrada.OTRO,
    COBAQ: client_1.PuertoEntrada.OTRO,
};
const TIPO_CONTENEDOR_ENUM = {
    CONT_20: client_1.TipoContenedor.CONT_20,
    CONT_40: client_1.TipoContenedor.CONT_40,
    CONT_40HC: client_1.TipoContenedor.CONT_40HC,
    LCL: client_1.TipoContenedor.LCL,
};
let LeadsService = LeadsService_1 = class LeadsService {
    prisma;
    logger = new common_1.Logger(LeadsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const all = await this.prisma.cotizacionNaviera.findMany({
            where: { numeroCotizacion: { not: null } },
            include: { cliente: { select: { id: true, razonSocial: true, email: true, telefono: true, contactoPrincipal: true } } },
            orderBy: { creadoEn: 'desc' },
        });
        const map = new Map();
        for (const r of all) {
            if (!r.numeroCotizacion)
                continue;
            if (!map.has(r.numeroCotizacion)) {
                const raw = r.rawResponse ?? {};
                map.set(r.numeroCotizacion, {
                    numeroCotizacion: r.numeroCotizacion,
                    cliente: r.cliente,
                    clienteId: r.clienteId,
                    puertoOrigen: r.puertoOrigen,
                    puertoDestino: r.puertoDestino,
                    tipoContenedor: r.tipoContenedor,
                    tipoMercancia: raw.tipoMercancia ?? undefined,
                    descripcionCarga: raw.descripcionCarga ?? undefined,
                    creadoEn: r.creadoEn,
                    estado: 'NUEVA',
                    operacionId: null,
                    mejorTarifa: null,
                    tarifas: [],
                });
            }
            const g = map.get(r.numeroCotizacion);
            const raw = r.rawResponse ?? {};
            if (r.operacionId) {
                g.estado = 'CONVERTIDA';
                g.operacionId = r.operacionId;
            }
            else if (raw.emailEnviadoEn && g.estado !== 'CONVERTIDA') {
                g.estado = 'ENVIADA';
            }
            g.tarifas.push({
                id: r.id,
                naviera: r.naviera,
                tarifaUSD: r.tarifaUSD,
                tiempoTransitoD: r.tiempoTransitoD,
                disponibilidad: r.disponibilidad,
                fuente: r.fuente,
            });
            if (r.tarifaUSD !== null && (g.mejorTarifa === null || r.tarifaUSD < g.mejorTarifa)) {
                g.mejorTarifa = r.tarifaUSD;
            }
        }
        return Array.from(map.values()).sort((a, b) => b.creadoEn.getTime() - a.creadoEn.getTime());
    }
    async findOne(numeroCotizacion) {
        const todos = await this.findAll();
        const found = todos.find(g => g.numeroCotizacion === numeroCotizacion);
        if (!found)
            throw new common_1.NotFoundException(`Cotización ${numeroCotizacion} no encontrada`);
        return found;
    }
    async contarNuevas() {
        const todos = await this.findAll();
        return todos.filter(g => g.estado === 'NUEVA').length;
    }
    async generarPdf(numeroCotizacion) {
        const lead = await this.findOne(numeroCotizacion);
        const hoy = new Date();
        const valida = new Date(hoy);
        valida.setDate(valida.getDate() + 2);
        const fmt = (d) => d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
        const tarifasOrdenadas = lead.tarifas
            .filter(t => t.tarifaUSD !== null)
            .sort((a, b) => (a.tarifaUSD ?? 9999) - (b.tarifaUSD ?? 9999));
        const html = (0, lead_cotizacion_template_1.generarHtmlCotizacion)({
            numeroCotizacion,
            fecha: fmt(hoy),
            validaHasta: fmt(valida),
            clienteNombre: lead.cliente?.razonSocial ?? 'Cliente',
            clienteContacto: lead.cliente?.contactoPrincipal ?? undefined,
            clienteEmail: lead.cliente?.email ?? undefined,
            clienteTelefono: lead.cliente?.telefono ?? undefined,
            puertoOrigen: UNLOCODE_LABEL[lead.puertoOrigen] ?? lead.puertoOrigen,
            puertoDestino: UNLOCODE_LABEL[lead.puertoDestino] ?? lead.puertoDestino,
            tipoContenedor: lead.tipoContenedor,
            tipoMercancia: lead.tipoMercancia,
            descripcionCarga: lead.descripcionCarga,
            esEstimado: tarifasOrdenadas.every(t => t.fuente === 'estimado'),
            tarifas: tarifasOrdenadas,
        });
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
    async enviarEmail(numeroCotizacion, usuarioId) {
        const lead = await this.findOne(numeroCotizacion);
        const emailDestino = lead.cliente?.email;
        if (!emailDestino)
            throw new common_1.BadRequestException('El cliente no tiene email registrado');
        const smtpHost = process.env.SMTP_HOST;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        if (!smtpHost || !smtpUser || !smtpPass) {
            this.logger.warn('SMTP no configurado — simulando envío de email');
            await this.marcarEmailEnviado(numeroCotizacion);
            return { ok: true, mensaje: `[DEMO] Email marcado como enviado a ${emailDestino} (SMTP no configurado)` };
        }
        const pdfBuffer = await this.generarPdf(numeroCotizacion);
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(process.env.SMTP_PORT ?? '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: smtpUser, pass: smtpPass },
        });
        const origen = UNLOCODE_LABEL[lead.puertoOrigen] ?? lead.puertoOrigen;
        const destino = UNLOCODE_LABEL[lead.puertoDestino] ?? lead.puertoDestino;
        await transporter.sendMail({
            from: `"VEXA AI Freight" <${process.env.SMTP_FROM ?? smtpUser}>`,
            to: emailDestino,
            subject: `Tu cotización de flete VEXA ${numeroCotizacion}`,
            html: `
        <div style="font-family: Helvetica, Arial, sans-serif; max-width:600px; margin:0 auto; color:#111827;">
          <div style="background:#0f172a; padding:24px 32px; border-radius:8px 8px 0 0;">
            <div style="color:#fff; font-size:22px; font-weight:900; letter-spacing:-0.5px;">VEXA</div>
            <div style="color:#22c55e; font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase;">AI Global Freight · Colombia</div>
          </div>
          <div style="padding:28px 32px; background:#fff; border:1px solid #e5e7eb; border-top:0;">
            <p style="font-size:15px; margin-bottom:16px;">Hola ${lead.cliente?.contactoPrincipal ?? lead.cliente?.razonSocial ?? 'cliente'},</p>
            <p style="font-size:14px; color:#374151; line-height:1.6; margin-bottom:16px;">
              Adjunto encontrará la cotización de flete marítimo <strong>${numeroCotizacion}</strong> para la ruta
              <strong>${origen} → ${destino}</strong>.
            </p>
            <p style="font-size:14px; color:#374151; line-height:1.6; margin-bottom:24px;">
              La cotización incluye tarifas de 6 navieras. Para confirmar su preferencia o solicitar información adicional,
              responda este correo o contáctenos directamente.
            </p>
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:14px 18px; font-size:13px; color:#166534; margin-bottom:24px;">
              <strong>¿Listo para proceder?</strong> Indíquenos la naviera de su preferencia y nuestro equipo gestionará la operación de principio a fin.
            </div>
            <p style="font-size:12px; color:#9ca3af; line-height:1.6;">
              Esta cotización es válida por 48 horas. Ref: ${numeroCotizacion}
            </p>
          </div>
        </div>`,
            attachments: [
                {
                    filename: `VEXA-Cotizacion-${numeroCotizacion}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        });
        await this.marcarEmailEnviado(numeroCotizacion);
        this.logger.log(`Email enviado: ${numeroCotizacion} → ${emailDestino} por usuario ${usuarioId}`);
        return { ok: true, mensaje: `Cotización enviada a ${emailDestino}` };
    }
    async marcarEmailEnviado(numeroCotizacion) {
        const records = await this.prisma.cotizacionNaviera.findMany({
            where: { numeroCotizacion },
        });
        await Promise.all(records.map(r => this.prisma.cotizacionNaviera.update({
            where: { id: r.id },
            data: {
                rawResponse: {
                    ...(r.rawResponse ?? {}),
                    emailEnviadoEn: new Date().toISOString(),
                },
            },
        })));
    }
    async convertirEnOperacion(numeroCotizacion, cotizacionId, usuarioId) {
        const lead = await this.findOne(numeroCotizacion);
        if (lead.estado === 'CONVERTIDA') {
            throw new common_1.BadRequestException('Esta cotización ya fue convertida en operación');
        }
        if (!lead.clienteId) {
            throw new common_1.BadRequestException('La cotización no tiene cliente asociado');
        }
        const cotSeleccionada = lead.tarifas.find(t => t.id === cotizacionId);
        if (!cotSeleccionada) {
            throw new common_1.BadRequestException('Cotización de naviera no encontrada');
        }
        const paisOrigen = UNLOCODE_TO_PAIS[lead.puertoOrigen] ?? 'Por definir';
        const puertoEntrada = UNLOCODE_TO_PUERTO[lead.puertoDestino] ?? client_1.PuertoEntrada.OTRO;
        const tipoContenedor = TIPO_CONTENEDOR_ENUM[lead.tipoContenedor] ?? client_1.TipoContenedor.OTRO;
        const descripcionCarga = lead.descripcionCarga
            || lead.tipoMercancia
            || 'Carga general';
        const etaPuerto = new Date();
        etaPuerto.setDate(etaPuerto.getDate() + 30);
        const generarCodigo = () => `FF-${Math.floor(1000 + Math.random() * 9000)}`;
        let codigo = generarCodigo();
        while (await this.prisma.operacion.findUnique({ where: { codigo } })) {
            codigo = generarCodigo();
        }
        const operacion = await this.prisma.operacion.create({
            data: {
                codigo,
                clienteId: lead.clienteId,
                tipo: client_1.TipoOperacion.IMPORTACION,
                paisOrigen,
                puertoEntrada,
                tipoContenedor,
                descripcionCarga,
                pesoTon: 0,
                destinoFinal: 'Por definir',
                etaPuerto,
                navieraActual: cotSeleccionada.naviera,
                creadoPor: usuarioId,
            },
        });
        const allRecords = await this.prisma.cotizacionNaviera.findMany({
            where: { numeroCotizacion },
        });
        await Promise.all(allRecords.map(r => this.prisma.cotizacionNaviera.update({
            where: { id: r.id },
            data: {
                operacionId: operacion.id,
                seleccionada: r.id === cotizacionId,
            },
        })));
        await this.prisma.logAuditoria.create({
            data: {
                usuarioId,
                operacionId: operacion.id,
                accion: 'OPERACION_DESDE_LEAD',
                detalle: { numeroCotizacion, naviera: cotSeleccionada.naviera, tarifaUSD: cotSeleccionada.tarifaUSD },
            },
        });
        this.logger.log(`Lead ${numeroCotizacion} convertido → Operación ${operacion.codigo} por ${usuarioId}`);
        return { ok: true, operacionId: operacion.id, operacionCodigo: operacion.codigo };
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = LeadsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map