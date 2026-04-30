import { PrismaService } from '../prisma/prisma.service';
import { ZonasFrancasService } from '../zonas-francas/zonas-francas.service';
export declare class SugerenciasService {
    private prisma;
    private zfService;
    constructor(prisma: PrismaService, zfService: ZonasFrancasService);
    generarParaOperacion(operacionId: string): Promise<{
        id: string;
        creadoEn: Date;
        tipo: string;
        aceptada: boolean | null;
        operacionId: string;
        titulo: string;
        descripcion: string;
        valorUSD: number | null;
    }[]>;
    aceptar(sugerenciaId: string): Promise<{
        id: string;
        creadoEn: Date;
        tipo: string;
        aceptada: boolean | null;
        operacionId: string;
        titulo: string;
        descripcion: string;
        valorUSD: number | null;
    }>;
    rechazar(sugerenciaId: string): Promise<{
        id: string;
        creadoEn: Date;
        tipo: string;
        aceptada: boolean | null;
        operacionId: string;
        titulo: string;
        descripcion: string;
        valorUSD: number | null;
    }>;
}
