import { CarrierRate } from './carrier.interface';
export declare class RateCacheService {
    private readonly store;
    key(origen: string, destino: string, tipoCarga: string): string;
    get(k: string): CarrierRate[] | null;
    set(k: string, rates: CarrierRate[]): void;
}
