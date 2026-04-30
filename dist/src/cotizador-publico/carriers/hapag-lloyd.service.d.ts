import { CarrierRate, CarrierService, RateQuery } from './carrier.interface';
export declare class HapagLloydService implements CarrierService {
    readonly name = "Hapag-Lloyd";
    private readonly logger;
    private token;
    private tokenExpiresAt;
    private get clientId();
    private get clientSecret();
    private fetchToken;
    getRate(query: RateQuery): Promise<CarrierRate>;
}
