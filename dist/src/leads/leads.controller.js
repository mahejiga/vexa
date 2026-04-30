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
var LeadsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const leads_service_1 = require("./leads.service");
let LeadsController = LeadsController_1 = class LeadsController {
    leadsService;
    logger = new common_1.Logger(LeadsController_1.name);
    constructor(leadsService) {
        this.leadsService = leadsService;
    }
    findAll() {
        return this.leadsService.findAll();
    }
    async contarNuevas() {
        const total = await this.leadsService.contarNuevas();
        return { nuevas: total };
    }
    findOne(numero) {
        return this.leadsService.findOne(numero);
    }
    async descargarPdf(numero, res) {
        const pdf = await this.leadsService.generarPdf(numero);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="VEXA-Cotizacion-${numero}.pdf"`,
            'Content-Length': pdf.length,
        });
        res.end(pdf);
    }
    async enviarEmail(numero, req) {
        return this.leadsService.enviarEmail(numero, req.user.id);
    }
    async convertir(numero, body, req) {
        return this.leadsService.convertirEnOperacion(numero, body.cotizacionId, req.user.id);
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('count/nuevas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "contarNuevas", null);
__decorate([
    (0, common_1.Get)(':numero'),
    __param(0, (0, common_1.Param)('numero')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeadsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':numero/pdf'),
    __param(0, (0, common_1.Param)('numero')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "descargarPdf", null);
__decorate([
    (0, common_1.Post)(':numero/enviar-email'),
    __param(0, (0, common_1.Param)('numero')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "enviarEmail", null);
__decorate([
    (0, common_1.Post)(':numero/convertir'),
    __param(0, (0, common_1.Param)('numero')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "convertir", null);
exports.LeadsController = LeadsController = LeadsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Leads / Cotizaciones Públicas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('leads'),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map