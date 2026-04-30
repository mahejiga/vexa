import { Injectable, Logger } from '@nestjs/common';
import { CarrierRate, CarrierService, RateQuery, CONTAINER_ISO, estimatedRate } from './carrier.interface';

const TOKEN_URL  = 'https://api.hlg.hapag-lloyd.com/oauth/token';
const RATES_URL  = 'https://api.hlg.hapag-lloyd.com/api/online-business/rates/v2/tariff-rates';
const TIMEOUT_MS = 8_000;

@Injectable()
export class HapagLloydService implements CarrierService {
  readonly name = 'Hapag-Lloyd';
  private readonly logger = new Logger(HapagLloydService.name);

  private token: string | null = null;
  private tokenExpiresAt = 0;

  private get clientId():     string { return process.env.HAPAG_CLIENT_ID ?? ''; }
  private get clientSecret(): string { return process.env.HAPAG_CLIENT_SECRET ?? ''; }

  private async fetchToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiresAt) return this.token;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'client_credentials',
          client_id:     this.clientId,
          client_secret: this.clientSecret,
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
    if (!this.clientId) return estimatedRate(this.name, query.originUNLOCODE, query.containerCode, 1);

    try {
      const token = await this.fetchToken();
      const iso   = CONTAINER_ISO[query.containerCode]?.hapag ?? '20DC';

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      let res: Response;
      try {
        res = await fetch(RATES_URL, {
          method: 'POST',
          headers: {
            Authorization:  `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept:         'application/json',
          },
          body: JSON.stringify({
            placeOfReceipt:   { locationCode: query.originUNLOCODE },
            placeOfDelivery:  { locationCode: query.destUNLOCODE   },
            equipment:        [{ isoCode: iso, quantity: 1 }],
          }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      if (!res.ok) throw new Error(`rates HTTP ${res.status}`);
      const data = await res.json() as {
        tariffRates?: Array<{
          totalAmount?: number;
          transitTime?: number;
          serviceCode?: string;
          validity?: { to?: string };
        }>;
      };

      const best = data.tariffRates?.[0];
      if (!best?.totalAmount) return estimatedRate(this.name, query.originUNLOCODE, query.containerCode, 1);

      let validezHoras: number | undefined;
      if (best.validity?.to) {
        const msLeft = new Date(best.validity.to).getTime() - Date.now();
        if (msLeft > 0) validezHoras = Math.floor(msLeft / 3_600_000);
      }

      return {
        naviera:         this.name,
        tarifaUSD:       Math.round(best.totalAmount),
        tiempoTransitoD: best.transitTime ?? 24,
        disponibilidad:  'alta',
        fuente:          'api',
        validezHoras,
        servicio:        best.serviceCode,
      };
    } catch (err) {
      this.logger.warn(`Hapag-Lloyd API error: ${(err as Error).message} — using estimate`);
      return estimatedRate(this.name, query.originUNLOCODE, query.containerCode, 1);
    }
  }
}
