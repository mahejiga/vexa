import { Injectable, Logger } from '@nestjs/common';
import { CarrierRate, CarrierService, RateQuery, CONTAINER_ISO, estimatedRate } from './carrier.interface';

const RATES_URL  = 'https://apis.cma-cgm.net/trade/quoting/v1/spotrates';
const TIMEOUT_MS = 8_000;

@Injectable()
export class CmaCgmService implements CarrierService {
  readonly name = 'CMA CGM';
  private readonly logger = new Logger(CmaCgmService.name);

  private get apiKey(): string { return process.env.CMA_CGM_API_KEY ?? ''; }

  async getRate(query: RateQuery): Promise<CarrierRate> {
    if (!this.apiKey) return estimatedRate(this.name, query.originUNLOCODE, query.containerCode, 2);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const iso = CONTAINER_ISO[query.containerCode]?.cma ?? '20DRY';

      const res = await fetch(RATES_URL, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/json',
          Accept:         'application/json',
        },
        body: JSON.stringify({
          origin:      { unlocode: query.originUNLOCODE },
          destination: { unlocode: query.destUNLOCODE   },
          container:   { isoCode: iso, quantity: 1 },
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        spotRates?: Array<{
          totalPrice?: number;
          transitTime?: number;
          service?: string;
          validTo?: string;
        }>;
      };

      const best = data.spotRates?.[0];
      if (!best?.totalPrice) return estimatedRate(this.name, query.originUNLOCODE, query.containerCode, 2);

      let validezHoras: number | undefined;
      if (best.validTo) {
        const msLeft = new Date(best.validTo).getTime() - Date.now();
        if (msLeft > 0) validezHoras = Math.floor(msLeft / 3_600_000);
      }

      return {
        naviera:         this.name,
        tarifaUSD:       Math.round(best.totalPrice),
        tiempoTransitoD: best.transitTime ?? 25,
        disponibilidad:  'alta',
        fuente:          'api',
        validezHoras,
        servicio:        best.service,
      };
    } catch (err) {
      this.logger.warn(`CMA CGM API error: ${(err as Error).message} — using estimate`);
      return estimatedRate(this.name, query.originUNLOCODE, query.containerCode, 2);
    } finally {
      clearTimeout(timer);
    }
  }
}
