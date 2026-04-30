"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HapagLloydService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HapagLloydService = void 0;
const common_1 = require("@nestjs/common");
const carrier_interface_1 = require("./carrier.interface");
const TOKEN_URL = 'https://api.hlg.hapag-lloyd.com/oauth/token';
const RATES_URL = 'https://api.hlg.hapag-lloyd.com/api/online-business/rates/v2/tariff-rates';
const TIMEOUT_MS = 8_000;
let HapagLloydService = HapagLloydService_1 = class HapagLloydService {
    name = 'Hapag-Lloyd';
    logger = new common_1.Logger(HapagLloydService_1.name);
    token = null;
    tokenExpiresAt = 0;
    get clientId() { return process.env.HAPAG_CLIENT_ID ?? ''; }
    get clientSecret() { return process.env.HAPAG_CLIENT_SECRET ?? ''; }
    async fetchToken() {
        if (this.token && Date.now() < this.tokenExpiresAt)
            return this.token;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        try {
            const res = await fetch(TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                }),
                signal: controller.signal,
            });
            if (!res.ok)
                throw new Error(`token HTTP ${res.status}`);
            const data = await res.json();
            this.token = data.access_token;
            this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
            return this.token;
        }
        finally {
            clearTimeout(timer);
        }
    }
    async getRate(query) {
        if (!this.clientId)
            return (0, carrier_interface_1.estimatedRate)(this.name, query.originUNLOCODE, query.containerCode, 1);
        try {
            const token = await this.fetchToken();
            const iso = carrier_interface_1.CONTAINER_ISO[query.containerCode]?.hapag ?? '20DC';
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
            let res;
            try {
                res = await fetch(RATES_URL, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        placeOfReceipt: { locationCode: query.originUNLOCODE },
                        placeOfDelivery: { locationCode: query.destUNLOCODE },
                        equipment: [{ isoCode: iso, quantity: 1 }],
                    }),
                    signal: controller.signal,
                });
            }
            finally {
                clearTimeout(timer);
            }
            if (!res.ok)
                throw new Error(`rates HTTP ${res.status}`);
            const data = await res.json();
            const best = data.tariffRates?.[0];
            if (!best?.totalAmount)
                return (0, carrier_interface_1.estimatedRate)(this.name, query.originUNLOCODE, query.containerCode, 1);
            let validezHoras;
            if (best.validity?.to) {
                const msLeft = new Date(best.validity.to).getTime() - Date.now();
                if (msLeft > 0)
                    validezHoras = Math.floor(msLeft / 3_600_000);
            }
            return {
                naviera: this.name,
                tarifaUSD: Math.round(best.totalAmount),
                tiempoTransitoD: best.transitTime ?? 24,
                disponibilidad: 'alta',
                fuente: 'api',
                validezHoras,
                servicio: best.serviceCode,
            };
        }
        catch (err) {
            this.logger.warn(`Hapag-Lloyd API error: ${err.message} — using estimate`);
            return (0, carrier_interface_1.estimatedRate)(this.name, query.originUNLOCODE, query.containerCode, 1);
        }
    }
};
exports.HapagLloydService = HapagLloydService;
exports.HapagLloydService = HapagLloydService = HapagLloydService_1 = __decorate([
    (0, common_1.Injectable)()
], HapagLloydService);
//# sourceMappingURL=hapag-lloyd.service.js.map