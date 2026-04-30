import { PrismaService } from '../prisma/prisma.service';
export interface LeadGrupo {
    numeroCotizacion: string;
    cliente: {
        id: string;
        razonSocial: string;
        email?: string | null;
        telefono?: string | null;
        contactoPrincipal?: string | null;
    } | null;
    clienteId: string | null;
    puertoOrigen: string;
    puertoDestino: string;
    tipoContenedor: string;
    tipoMercancia?: string;
    descripcionCarga?: string;
    creadoEn: Date;
    estado: 'NUEVA' | 'ENVIADA' | 'CONVERTIDA';
    operacionId: string | null;
    mejorTarifa: number | null;
    tarifas: Array<{
        id: string;
        naviera: string;
        tarifaUSD: number | null;
        tiempoTransitoD: number | null;
        disponibilidad: string | null;
        fuente: string;
    }>;
}
export declare class LeadsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(): Promise<LeadGrupo[]>;
    findOne(numeroCotizacion: string): Promise<LeadGrupo>;
    contarNuevas(): Promise<number>;
    generarPdf(numeroCotizacion: string): Promise<Buffer>;
    enviarEmail(numeroCotizacion: string, usuarioId: string): Promise<{
        ok: boolean;
        mensaje: string;
    }>;
    private marcarEmailEnviado;
    convertirEnOperacion(numeroCotizacion: string, cotizacionId: string, usuarioId: string): Promise<{
        ok: boolean;
        operacionId: string;
        operacionCodigo: string;
    }>;
}
