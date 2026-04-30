"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperacionesModule = void 0;
const common_1 = require("@nestjs/common");
const operaciones_service_1 = require("./operaciones.service");
const operaciones_controller_1 = require("./operaciones.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const cotizador_publico_module_1 = require("../cotizador-publico/cotizador-publico.module");
let OperacionesModule = class OperacionesModule {
};
exports.OperacionesModule = OperacionesModule;
exports.OperacionesModule = OperacionesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, cotizador_publico_module_1.CotizadorPublicoModule],
        providers: [operaciones_service_1.OperacionesService],
        controllers: [operaciones_controller_1.OperacionesController],
        exports: [operaciones_service_1.OperacionesService],
    })
], OperacionesModule);
//# sourceMappingURL=operaciones.module.js.map