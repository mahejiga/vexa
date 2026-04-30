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
exports.ZonasFrancasController = void 0;
const common_1 = require("@nestjs/common");
const zonas_francas_service_1 = require("./zonas-francas.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let ZonasFrancasController = class ZonasFrancasController {
    zfService;
    constructor(zfService) {
        this.zfService = zfService;
    }
    findAll() {
        return this.zfService.findAll();
    }
    dashboard() {
        return this.zfService.resumenDashboard();
    }
    actualizarOcupacion(id, ocupacionM2) {
        return this.zfService.actualizarOcupacion(id, ocupacionM2);
    }
};
exports.ZonasFrancasController = ZonasFrancasController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ZonasFrancasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ZonasFrancasController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Put)(':id/ocupacion'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('ocupacionM2')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], ZonasFrancasController.prototype, "actualizarOcupacion", null);
exports.ZonasFrancasController = ZonasFrancasController = __decorate([
    (0, swagger_1.ApiTags)('Zonas Francas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('zonas-francas'),
    __metadata("design:paramtypes", [zonas_francas_service_1.ZonasFrancasService])
], ZonasFrancasController);
//# sourceMappingURL=zonas-francas.controller.js.map