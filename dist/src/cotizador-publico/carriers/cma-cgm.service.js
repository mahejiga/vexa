"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CmaCgmService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmaCgmService = void 0;
const common_1 = require("@nestjs/common");
const carrier_interface_1 = require("./carrier.interface");
const RATES_URL = 'https://apis.cma-cgm.net/trade/quoting/v1/spotrates';
const TIMEOUT_MS = 8_000;
let CmaCgmService = CmaCgmService_1 = class CmaCgmService {
    name = 'CMA CGM';
    logger = new common_1.Logger(CmaCgmService_1.name);
    get apiKey() { return process.env.CMA_CGM_API_KEY ?? ''; }
    async getRate(query) {
        if (!this.apiKey)
            return (0, carrier_interface_1.estimatedRate)(this.name, query.originUNLOCODE, query.containerCode, 2);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        try {
            const iso = carrier_interface_1.CONTAINER_ISO[query.containerCode]?.cma ?? '20DRY';
            const res = await fetch(RATES_URL, {
                method: 'POST',
                headers: {
                    'Ocp-Apim-Subscription-Key': this.apiKey,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    origin: { unlocode: query.originUNLOCODE },
                    destination: { unlocode: query.destUNLOCODE },
                    container: { isoCode: iso, quantity: 1 },
                }),
                signal: controller.signal,
            });
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const best = data.spotRates?.[0];
            if (!best?.totalPrice)
                return (0, carrier_interface_1.estimatedRate)(this.name, query.originUNLOCODE, query.containerCode, 2);
            let validezHoras;
            if (best.validTo) {
                const msLeft = new Date(best.validTo).getTime() - Date.now();
                if (msLeft > 0)
                    validezHoras = Math.floor(msLeft / 3_600_000);
            }
            return {
                naviera: this.name,
                tarifaUSD: Math.round(best.totalPrice),
                tiempoTransitoD: best.transitTime ?? 25,
                disponibilidad: 'alta',
                fuente: 'api',
                validezHoras,
                servicio: best.service,
            };
        }
        catch (err) {
            this.logger.warn(`CMA CGM API error: ${err.message} — using estimate`);
            return (0, carrier_interface_1.estimatedRate)(this.name, query.originUNLOCODE, query.containerCode, 2);
        }
        finally {
            clearTimeout(timer);
        }
    }
};
exports.CmaCgmService = CmaCgmService;
exports.CmaCgmService = CmaCgmService = CmaCgmService_1 = __decorate([
    (0, common_1.Injectable)()
], CmaCgmService);
//# sourceMappingURL=cma-cgm.service.js.map