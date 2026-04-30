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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientesService = class ClientesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(busqueda) {
        return this.prisma.cliente.findMany({
            where: busqueda
                ? {
                    OR: [
                        { razonSocial: { contains: busqueda, mode: 'insensitive' } },
                        { nit: { contains: busqueda, mode: 'insensitive' } },
                    ],
                }
                : undefined,
            include: {
                _count: { select: { operaciones: true } },
            },
            orderBy: { razonSocial: 'asc' },
        });
    }
    async findOne(id) {
        const cliente = await this.prisma.cliente.findUnique({
            where: { id },
            include: {
                operaciones: {
                    orderBy: { creadoEn: 'desc' },
                    take: 10,
                    include: { zonaFranca: true },
                },
            },
        });
        if (!cliente)
            throw new common_1.NotFoundException('Cliente no encontrado');
        return cliente;
    }
    async create(data) {
        return this.prisma.cliente.create({ data });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.cliente.update({ where: { id }, data });
    }
};
exports.ClientesService = ClientesService;
exports.ClientesService = ClientesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientesService);
//# sourceMappingURL=clientes.service.js.map