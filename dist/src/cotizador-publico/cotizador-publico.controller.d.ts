import { MaerskService } from './carriers/maersk.service';
import { HapagLloydService } from './carriers/hapag-lloyd.service';
import { CmaCgmService } from './carriers/cma-cgm.service';
import { RateCacheService } from './carriers/rate-cache.service';
import { CarrierRate } from './carriers/carrier.interface';
import { PrismaService } from '../prisma/prisma.service';
export declare class CotizadorPublicoController {
    private readonly maersk;
    private readonly hapag;
    private readonly cma;
    private readonly rateCache;
    private readonly prisma;
    private readonly logger;
    constructor(maersk: MaerskService, hapag: HapagLloydService, cma: CmaCgmService, rateCache: RateCacheService, prisma: PrismaService);
    buscarCliente(email: string): Promise<{
        id: string;
        email: string | null;
        ciudad: string | null;
        nit: string | null;
        razonSocial: string;
        contactoPrincipal: string | null;
        telefono: string | null;
        cotizaciones: {
            creadoEn: Date;
            tipoContenedor: string;
            naviera: string;
            tarifaUSD: number | null;
            numeroCotizacion: string | null;
            puertoOrigen: string;
            rawResponse: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } | null>;
    consultar(body: {
        origen: string;
        destino: string;
        tipoCarga: string;
        tipoMercancia?: string;
        descripcionCarga?: string;
        empresa?: string;
        contacto?: string;
        email?: string;
        telefono?: string;
    }): Promise<{
        ok: boolean;
        tarifas: CarrierRate[];
        numeroCotizacion: string;
        consultadoEn: string;
        fuente: string;
    } | {
        ok: boolean;
        tarifas: CarrierRate[];
        numeroCotizacion: string;
        consultadoEn: string;
        fuente?: undefined;
    }>;
}
