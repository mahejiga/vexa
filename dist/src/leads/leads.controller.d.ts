import type { Response } from 'express';
import { LeadsService } from './leads.service';
export declare class LeadsController {
    private readonly leadsService;
    private readonly logger;
    constructor(leadsService: LeadsService);
    findAll(): Promise<import("./leads.service").LeadGrupo[]>;
    contarNuevas(): Promise<{
        nuevas: number;
    }>;
    findOne(numero: string): Promise<import("./leads.service").LeadGrupo>;
    descargarPdf(numero: string, res: Response): Promise<void>;
    enviarEmail(numero: string, req: any): Promise<{
        ok: boolean;
        mensaje: string;
    }>;
    convertir(numero: string, body: {
        cotizacionId: string;
    }, req: any): Promise<{
        ok: boolean;
        operacionId: string;
        operacionCodigo: string;
    }>;
}
