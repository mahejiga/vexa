export interface RateQuery {
    originUNLOCODE: string;
    destUNLOCODE: string;
    containerCode: string;
}
export interface CarrierRate {
    naviera: string;
    tarifaUSD: number;
    tiempoTransitoD: number;
    disponibilidad: 'alta' | 'media' | 'limitada';
    fuente: 'api' | 'estimado';
    validezHoras?: number;
    servicio?: string;
}
export interface CarrierService {
    readonly name: string;
    getRate(query: RateQuery): Promise<CarrierRate>;
}
export declare const UNLOCODE: Record<string, string>;
export declare const CONTAINER_ISO: Record<string, {
    maersk: string;
    hapag: string;
    cma: string;
    label: string;
}>;
export declare function estimatedRate(nombre: string, origen: string, tipoCarga: string, index: number): CarrierRate;
