import { DocumentosService } from './documentos.service';
export declare class DocumentosController {
    private documentosService;
    constructor(documentosService: DocumentosService);
    findByOperacion(operacionId: string): Promise<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tipo: import(".prisma/client").$Enums.TipoDocumento;
        operacionId: string;
        numero: string | null;
        fechaEmision: Date | null;
        observaciones: string | null;
    }[]>;
    create(body: any): Promise<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tipo: import(".prisma/client").$Enums.TipoDocumento;
        operacionId: string;
        numero: string | null;
        fechaEmision: Date | null;
        observaciones: string | null;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tipo: import(".prisma/client").$Enums.TipoDocumento;
        operacionId: string;
        numero: string | null;
        fechaEmision: Date | null;
        observaciones: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        nombre: string;
        creadoEn: Date;
        actualizadoEn: Date;
        tipo: import(".prisma/client").$Enums.TipoDocumento;
        operacionId: string;
        numero: string | null;
        fechaEmision: Date | null;
        observaciones: string | null;
    }>;
}
