import { ZonasFrancasService } from './zonas-francas.service';
export declare class ZonasFrancasController {
    private zfService;
    constructor(zfService: ZonasFrancasService);
    findAll(): Promise<{
        disponibleM2: number;
        ocupacionPct: number;
        cargas: {
            id: string;
            creadoEn: Date;
            zonaFrancaId: string;
            operacionId: string | null;
            descripcion: string;
            fechaEntrada: Date;
            m2Ocupados: number;
            fechaSalidaEstimada: Date | null;
            esClientePropio: boolean;
        }[];
        _count: {
            cargas: number;
            operaciones: number;
        };
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
    }[]>;
    dashboard(): Promise<{
        zonas: {
            disponibleM2: number;
            ocupacionPct: number;
            cargas: {
                id: string;
                creadoEn: Date;
                zonaFrancaId: string;
                operacionId: string | null;
                descripcion: string;
                fechaEntrada: Date;
                m2Ocupados: number;
                fechaSalidaEstimada: Date | null;
                esClientePropio: boolean;
            }[];
            _count: {
                cargas: number;
                operaciones: number;
            };
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
        }[];
        totalCapacidadM2: number;
        totalOcupadoM2: number;
        totalDisponibleM2: number;
        ocupacionGlobalPct: number;
    }>;
    actualizarOcupacion(id: string, ocupacionM2: number): Promise<{
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
    }>;
}
