import { ClientesService } from './clientes.service';
export declare class ClientesController {
    private clientesService;
    constructor(clientesService: ClientesService);
    findAll(busqueda?: string): Promise<({
        _count: {
            operaciones: number;
        };
    } & {
        id: string;
        email: string | null;
        activo: boolean;
        creadoEn: Date;
        ciudad: string | null;
        nit: string | null;
        razonSocial: string;
        contactoPrincipal: string | null;
        telefono: string | null;
        actualizadoEn: Date;
    })[]>;
    findOne(id: string): Promise<{
        operaciones: ({
            zonaFranca: {
                id: string;
                nombre: string;
                creadoEn: Date;
                ciudad: string;
                distanciaAlPuertoKm: number;
                capacidadTotalM2: number;
                ocupacionActualM2: number;
                precioPorDiaUSD: number;
                activa: boolean;
                ultimaSincronizacion: Date;
            } | null;
        } & {
            id: string;
            creadoEn: Date;
            actualizadoEn: Date;
            codigo: string;
            clienteId: string;
            tipo: import(".prisma/client").$Enums.TipoOperacion;
            paisOrigen: string;
            paisDestino: string | null;
            puertoEntrada: import(".prisma/client").$Enums.PuertoEntrada;
            tipoContenedor: import(".prisma/client").$Enums.TipoContenedor;
            descripcionCarga: string;
            pesoTon: number;
            destinoFinal: string;
            etaPuerto: Date;
            numeroBlAwb: string | null;
            navieraActual: string | null;
            valorFobUSD: number | null;
            notasInternas: string | null;
            estado: import(".prisma/client").$Enums.EstadoOperacion;
            zonaFrancaId: string | null;
            creadoPor: string;
        })[];
    } & {
        id: string;
        email: string | null;
        activo: boolean;
        creadoEn: Date;
        ciudad: string | null;
        nit: string | null;
        razonSocial: string;
        contactoPrincipal: string | null;
        telefono: string | null;
        actualizadoEn: Date;
    }>;
    create(body: any): Promise<{
        id: string;
        email: string | null;
        activo: boolean;
        creadoEn: Date;
        ciudad: string | null;
        nit: string | null;
        razonSocial: string;
        contactoPrincipal: string | null;
        telefono: string | null;
        actualizadoEn: Date;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        email: string | null;
        activo: boolean;
        creadoEn: Date;
        ciudad: string | null;
        nit: string | null;
        razonSocial: string;
        contactoPrincipal: string | null;
        telefono: string | null;
        actualizadoEn: Date;
    }>;
}
