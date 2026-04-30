"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SugerenciasModule = void 0;
const common_1 = require("@nestjs/common");
const sugerencias_service_1 = require("./sugerencias.service");
const sugerencias_controller_1 = require("./sugerencias.controller");
const zonas_francas_module_1 = require("../zonas-francas/zonas-francas.module");
let SugerenciasModule = class SugerenciasModule {
};
exports.SugerenciasModule = SugerenciasModule;
exports.SugerenciasModule = SugerenciasModule = __decorate([
    (0, common_1.Module)({
        imports: [zonas_francas_module_1.ZonasFrancasModule],
        providers: [sugerencias_service_1.SugerenciasService],
        controllers: [sugerencias_controller_1.SugerenciasController],
        exports: [sugerencias_service_1.SugerenciasService],
    })
], SugerenciasModule);
//# sourceMappingURL=sugerencias.module.js.map