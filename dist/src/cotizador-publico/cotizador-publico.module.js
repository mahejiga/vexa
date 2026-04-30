"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CotizadorPublicoModule = void 0;
const common_1 = require("@nestjs/common");
const cotizador_publico_controller_1 = require("./cotizador-publico.controller");
const maersk_service_1 = require("./carriers/maersk.service");
const hapag_lloyd_service_1 = require("./carriers/hapag-lloyd.service");
const cma_cgm_service_1 = require("./carriers/cma-cgm.service");
const rate_cache_service_1 = require("./carriers/rate-cache.service");
const prisma_module_1 = require("../prisma/prisma.module");
let CotizadorPublicoModule = class CotizadorPublicoModule {
};
exports.CotizadorPublicoModule = CotizadorPublicoModule;
exports.CotizadorPublicoModule = CotizadorPublicoModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [cotizador_publico_controller_1.CotizadorPublicoController],
        providers: [maersk_service_1.MaerskService, hapag_lloyd_service_1.HapagLloydService, cma_cgm_service_1.CmaCgmService, rate_cache_service_1.RateCacheService],
        exports: [maersk_service_1.MaerskService, hapag_lloyd_service_1.HapagLloydService, cma_cgm_service_1.CmaCgmService, rate_cache_service_1.RateCacheService],
    })
], CotizadorPublicoModule);
//# sourceMappingURL=cotizador-publico.module.js.map