"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SugerenciasController = void 0;
const common_1 = require("@nestjs/common");
const sugerencias_service_1 = require("./sugerencias.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let SugerenciasController = class SugerenciasController {
    sugerenciasService;
    constructor(sugerenciasService) {
        this.sugerenciasService = sugerenciasService;
    }
    generar(operacionId) {
        return this.sugerenciasService.generarParaOperacion(operacionId);
    }
    aceptar(id) {
        return this.sugerenciasService.aceptar(id);
    }
    rechazar(id) {
        return this.sugerenciasService.rechazar(id);
    }
};
exports.SugerenciasController = SugerenciasController;
__decorate([
    (0, common_1.Post)('generar/:operacionId'),
    __param(0, (0, common_1.Param)('operacionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SugerenciasController.prototype, "generar", null);
__decorate([
    (0, common_1.Put)(':id/aceptar'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SugerenciasController.prototype, "aceptar", null);
__decorate([
    (0, common_1.Put)(':id/rechazar'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SugerenciasController.prototype, "rechazar", null);
exports.SugerenciasController = SugerenciasController = __decorate([
    (0, swagger_1.ApiTags)('Sugerencias'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sugerencias'),
    __metadata("design:paramtypes", [sugerencias_service_1.SugerenciasService])
], SugerenciasController);
//# sourceMappingURL=sugerencias.controller.js.map