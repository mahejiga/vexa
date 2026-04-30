import { CarrierRate, CarrierService, RateQuery } from './carrier.interface';
export declare class CmaCgmService implements CarrierService {
    readonly name = "CMA CGM";
    private readonly logger;
    private get apiKey();
    getRate(query: RateQuery): Promise<CarrierRate>;
}
