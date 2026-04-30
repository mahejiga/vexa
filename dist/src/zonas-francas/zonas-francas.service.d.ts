import { PrismaService } from '../prisma/prisma.service';
import { PuertoEntrada } from '@prisma/client';
export declare class ZonasFrancasService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findMasCercana(puerto: PuertoEntrada, m2Requeridos?: number): Promise<{
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
    actualizarOcupacion(id: string, ocupacionActualM2: number): Promise<{
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
    resumenDashboard(): Promise<{
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
}
