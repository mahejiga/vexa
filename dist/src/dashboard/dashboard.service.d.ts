import { PrismaService } from '../prisma/prisma.service';
import { ZonasFrancasService } from '../zonas-francas/zonas-francas.service';
import { LeadsService } from '../leads/leads.service';
export declare class DashboardService {
    private prisma;
    private zfService;
    private leadsService;
    constructor(prisma: PrismaService, zfService: ZonasFrancasService, leadsService: LeadsService);
    getResumen(): Promise<{
        operaciones: {
            activas: number;
            mes: number;
            conZF: number;
            sinZF: number;
            conAldia: number;
        };
        zonasFrancas: {
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
        };
        crm: {
            clientesConCrossSell: number;
        };
        revenue: {
            estimadoCrossSellUSD: number;
        };
        leads: {
            nuevas: number;
        };
    }>;
}
