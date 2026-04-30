"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const clientes_module_1 = require("./clientes/clientes.module");
const operaciones_module_1 = require("./operaciones/operaciones.module");
const zonas_francas_module_1 = require("./zonas-francas/zonas-francas.module");
const sugerencias_module_1 = require("./sugerencias/sugerencias.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const propuesta_module_1 = require("./propuesta/propuesta.module");
const cotizador_publico_module_1 = require("./cotizador-publico/cotizador-publico.module");
const documentos_module_1 = require("./documentos/documentos.module");
const leads_module_1 = require("./leads/leads.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            clientes_module_1.ClientesModule,
            operaciones_module_1.OperacionesModule,
            zonas_francas_module_1.ZonasFrancasModule,
            sugerencias_module_1.SugerenciasModule,
            dashboard_module_1.DashboardModule,
            propuesta_module_1.PropuestaModule,
            cotizador_publico_module_1.CotizadorPublicoModule,
            documentos_module_1.DocumentosModule,
            leads_module_1.LeadsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map