import { Injectable, Logger } from '@nestjs/common';
import { CarrierRate, CarrierService, RateQuery, CONTAINER_ISO, estimatedRate } from './carrier.interface';

const TOKEN_URL  = 'https://api.maersk.com/oauth2/access_token';
const RATES_URL  = 'https://api.maersk.com/products/spot-rates';
const TIMEOUT_MS = 8_000;

@Injectable()
export class MaerskService implements CarrierService {
  readonly name = 'Maersk';
  private readonly logger = new Logger(MaerskService.name);

  private token: string | null = null;
  private tokenExpiresAt = 0;

  private get consumerKey(): string    { return process.env.MAERSK_CONSUMER_KEY ?? ''; }
  private get consumerSecret(): string { return process.env.MAERSK_CONSUMER_SECRET ?? ''; }

  private async fetchToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) return this.token;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Consumer-Key': this.consumerKey,
        },
        body: new URLSearchParams({
          grant_type:    'client_credentials',
          client_id:     this.consumerKey,
          client_secret: this.consumerSecret,
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`token HTTP ${res.status}`);
      const data = await res.json() as { access_token: string; expires_in: number };
      this.token = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
      return this.token;
    } finally {
      clearTimeout(timer);
    }
  }

  async getRate(query: RateQuery): Promise<CarrierRate> {
    if (!this.consumerKey) return estimatedRate(this.name, query.originUNLOCODE, query.containerCode, 0);

    try {
      const token = await this.fetchToken();
      const iso   = CONTAINER_ISO[query.containerCode]?.maersk ?? '22G1';

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const url = `${RATES_URL}?` + new URLSearchParams({
        originPortUNCode:      query.originUNLOCODE,
        destinationPortUNCode: query.destUNLOCODE,
        equipmentCode:         iso,
        numberOfContainers:    '1',
      });

      let res: Response;
      try {
        res = await fetch(url, {
          headers: {
            Authorization:  `Bearer ${token}`,
            'Consumer-Key': this.consumerKey,
            Accept:         'application/json',
          },
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      if (!res.ok) throw new Error(`rates HTTP ${res.status}`);
      const data = await res.json() as {
        ocean?: { price?: number; transitDays?: number; serviceLoopName?: string };
      };

      const ocean = data.ocean;
      if (!ocean?.price) return estimatedRate(this.name, query.originUNLOCODE, query.containerCode, 0);

      return {
        naviera:         this.name,
        tarifaUSD:       Math.round(ocean.price),
        tiempoTransitoD: ocean.transitDays ?? 22,
        disponibilidad:  'alta',
        fuente:          'api',
        validezHoras:    48,
        servicio:        ocean.serviceLoopName,
      };
    } catch (err) {
      this.logger.warn(`Maersk API error: ${(err as Error).message} — using estimate`);
      return estimatedRate(this.name, query.originUNLOCODE, query.containerCode, 0);
    }
  }
}
