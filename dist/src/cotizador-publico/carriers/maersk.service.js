"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MaerskService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaerskService = void 0;
const common_1 = require("@nestjs/common");
const carrier_interface_1 = require("./carrier.interface");
const TOKEN_URL = 'https://api.maersk.com/oauth2/access_token';
const RATES_URL = 'https://api.maersk.com/products/spot-rates';
const TIMEOUT_MS = 8_000;
let MaerskService = MaerskService_1 = class MaerskService {
    name = 'Maersk';
    logger = new common_1.Logger(MaerskService_1.name);
    token = null;
    tokenExpiresAt = 0;
    get consumerKey() { return process.env.MAERSK_CONSUMER_KEY ?? ''; }
    get consumerSecret() { return process.env.MAERSK_CONSUMER_SECRET ?? ''; }
    async fetchToken() {
        if (this.token && Date.now() < this.tokenExpiresAt)
            return this.token;
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
                    grant_type: 'client_credentials',
                    client_id: this.consumerKey,
                    client_secret: this.consumerSecret,
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
        if (!this.consumerKey)
            return (0, carrier_interface_1.estimatedRate)(this.name, query.originUNLOCODE, query.containerCode, 0);
        try {
            const token = await this.fetchToken();
            const iso = carrier_interface_1.CONTAINER_ISO[query.containerCode]?.maersk ?? '22G1';
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
            const url = `${RATES_URL}?` + new URLSearchParams({
                originPortUNCode: query.originUNLOCODE,
                destinationPortUNCode: query.destUNLOCODE,
                equipmentCode: iso,
                numberOfContainers: '1',
            });
            let res;
            try {
                res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Consumer-Key': this.consumerKey,
                        Accept: 'application/json',
                    },
                    signal: controller.signal,
                });
            }
            finally {
                clearTimeout(timer);
            }
            if (!res.ok)
                throw new Error(`rates HTTP ${res.status}`);
            const data = await res.json();
            const ocean = data.ocean;
            if (!ocean?.price)
                return (0, carrier_interface_1.estimatedRate)(this.name, query.originUNLOCODE, query.containerCode, 0);
            return {
                naviera: this.name,
                tarifaUSD: Math.round(ocean.price),
                tiempoTransitoD: ocean.transitDays ?? 22,
                disponibilidad: 'alta',
                fuente: 'api',
                validezHoras: 48,
                servicio: ocean.serviceLoopName,
            };
        }
        catch (err) {
            this.logger.warn(`Maersk API error: ${err.message} — using estimate`);
            return (0, carrier_interface_1.estimatedRate)(this.name, query.originUNLOCODE, query.containerCode, 0);
        }
    }
};
exports.MaerskService = MaerskService;
exports.MaerskService = MaerskService = MaerskService_1 = __decorate([
    (0, common_1.Injectable)()
], MaerskService);
//# sourceMappingURL=maersk.service.js.map