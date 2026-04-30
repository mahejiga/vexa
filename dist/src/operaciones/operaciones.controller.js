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
exports.OperacionesController = void 0;
const common_1 = require("@nestjs/common");
const operaciones_service_1 = require("./operaciones.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let OperacionesController = class OperacionesController {
    operacionesService;
    constructor(operacionesService) {
        this.operacionesService = operacionesService;
    }
    findAll(estado, clienteId, puertoEntrada, busqueda) {
        return this.operacionesService.findAll({ estado, clienteId, puertoEntrada, busqueda });
    }
    stats() {
        return this.operacionesService.stats();
    }
    findOne(id) {
        return this.operacionesService.findOne(id);
    }
    create(body, req) {
        return this.operacionesService.create({ ...body, creadoPor: req.user.id });
    }
    update(id, body, req) {
        return this.operacionesService.update(id, body, req.user.id);
    }
    cambiarEstado(id, estado, req) {
        return this.operacionesService.cambiarEstado(id, estado, req.user.id);
    }
    asignarZF(id, zonaFrancaId, req) {
        return this.operacionesService.asignarZonaFranca(id, zonaFrancaId, req.user.id);
    }
    cotizar(id, origenUNLOCODE, req) {
        return this.operacionesService.cotizarNavieras(id, req.user.id, origenUNLOCODE);
    }
    seleccionarCotizacion(id, cotId, req) {
        return this.operacionesService.seleccionarCotizacion(id, cotId, req.user.id);
    }
};
exports.OperacionesController = OperacionesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('estado')),
    __param(1, (0, common_1.Query)('clienteId')),
    __param(2, (0, common_1.Query)('puertoEntrada')),
    __param(3, (0, common_1.Query)('busqueda')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String]),
    __metadata("design:returntype", void 0)
], OperacionesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OperacionesController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OperacionesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OperacionesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OperacionesController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/estado'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('estado')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OperacionesController.prototype, "cambiarEstado", null);
__decorate([
    (0, common_1.Put)(':id/asignar-zf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('zonaFrancaId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], OperacionesController.prototype, "asignarZF", null);
__decorate([
    (0, common_1.Post)(':id/cotizar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('origenUNLOCODE')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], OperacionesController.prototype, "cotizar", null);
__decorate([
    (0, common_1.Put)(':id/cotizaciones/:cotId/seleccionar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('cotId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], OperacionesController.prototype, "seleccionarCotizacion", null);
exports.OperacionesController = OperacionesController = __decorate([
    (0, swagger_1.ApiTags)('Operaciones'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('operaciones'),
    __metadata("design:paramtypes", [operaciones_service_1.OperacionesService])
], OperacionesController);
//# sourceMappingURL=operaciones.controller.js.map