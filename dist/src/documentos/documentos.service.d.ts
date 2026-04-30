import { PrismaService } from '../prisma/prisma.service';
import { TipoDocumento } from '@prisma/client';
export declare class DocumentosService {
    private prisma;
    constructor(prisma: PrismaService);
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
    create(data: {
        operacionId: string;
        tipo: TipoDocumento;
        nombre: string;
        numero?: string;
        fechaEmision?: Date;
        observaciones?: string;
    }): Promise<{
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
    update(id: string, data: {
        nombre?: string;
        numero?: string;
        fechaEmision?: Date;
        observaciones?: string;
    }): Promise<{
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
