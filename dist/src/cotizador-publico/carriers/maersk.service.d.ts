import { CarrierRate, CarrierService, RateQuery } from './carrier.interface';
export declare class MaerskService implements CarrierService {
    readonly name = "Maersk";
    private readonly logger;
    private token;
    private tokenExpiresAt;
    private get consumerKey();
    private get consumerSecret();
    private fetchToken;
    getRate(query: RateQuery): Promise<CarrierRate>;
}
