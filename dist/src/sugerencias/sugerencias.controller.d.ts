import { SugerenciasService } from './sugerencias.service';
export declare class SugerenciasController {
    private sugerenciasService;
    constructor(sugerenciasService: SugerenciasService);
    generar(operacionId: string): Promise<{
        id: string;
        creadoEn: Date;
        tipo: string;
        aceptada: boolean | null;
        operacionId: string;
        titulo: string;
        descripcion: string;
        valorUSD: number | null;
    }[]>;
    aceptar(id: string): Promise<{
        id: string;
        creadoEn: Date;
        tipo: string;
        aceptada: boolean | null;
        operacionId: string;
        titulo: string;
        descripcion: string;
        valorUSD: number | null;
    }>;
    rechazar(id: string): Promise<{
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
