"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateCacheService = void 0;
const common_1 = require("@nestjs/common");
const TTL_MS = 30 * 60 * 1000;
let RateCacheService = class RateCacheService {
    store = new Map();
    key(origen, destino, tipoCarga) {
        return `${origen}:${destino}:${tipoCarga}`;
    }
    get(k) {
        const entry = this.store.get(k);
        if (!entry || Date.now() > entry.expiresAt) {
            this.store.delete(k);
            return null;
        }
        return entry.rates;
    }
    set(k, rates) {
        this.store.set(k, { rates, expiresAt: Date.now() + TTL_MS });
    }
};
exports.RateCacheService = RateCacheService;
exports.RateCacheService = RateCacheService = __decorate([
    (0, common_1.Injectable)()
], RateCacheService);
//# sourceMappingURL=rate-cache.service.js.map