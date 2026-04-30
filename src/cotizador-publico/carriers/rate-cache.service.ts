import { Injectable } from '@nestjs/common';
import { CarrierRate } from './carrier.interface';

const TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  rates: CarrierRate[];
  expiresAt: number;
}

@Injectable()
export class RateCacheService {
  private readonly store = new Map<string, CacheEntry>();

  key(origen: string, destino: string, tipoCarga: string): string {
    return `${origen}:${destino}:${tipoCarga}`;
  }

  get(k: string): CarrierRate[] | null {
    const entry = this.store.get(k);
    if (!entry || Date.now() > entry.expiresAt) {
      this.store.delete(k);
      return null;
    }
    return entry.rates;
  }

  set(k: string, rates: CarrierRate[]): void {
    this.store.set(k, { rates, expiresAt: Date.now() + TTL_MS });
  }
}
