"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Sembrando datos iniciales...');
    const adminPassword = await bcrypt.hash('Admin2026!', 10);
    const admin = await prisma.usuario.upsert({
        where: { email: 'admin@vexa.co' },
        update: {},
        create: {
            nombre: 'Administrador',
            email: 'admin@vexa.co',
            password: adminPassword,
            rol: 'ADMIN',
        },
    });
    const operadorPassword = await bcrypt.hash('Operador2026!', 10);
    const operador = await prisma.usuario.upsert({
        where: { email: 'operador@vexa.co' },
        update: {},
        create: {
            nombre: 'Juan Carlos Ruiz',
            email: 'operador@vexa.co',
            password: operadorPassword,
            rol: 'OPERADOR_FREIGHT',
        },
    });
    console.log('✅ Usuarios creados');
    const zfCartagena = await prisma.zonaFranca.upsert({
        where: { id: 'zf-cartagena-001' },
        update: {},
        create: {
            id: 'zf-cartagena-001',
            nombre: 'ZF Parque Central Cartagena',
            ciudad: 'Cartagena',
            distanciaAlPuertoKm: 2.8,
            capacidadTotalM2: 5000,
            ocupacionActualM2: 3200,
            precioPorDiaUSD: 180,
        },
    });
    const zfSantaMarta = await prisma.zonaFranca.upsert({
        where: { id: 'zf-santamarta-001' },
        update: {},
        create: {
            id: 'zf-santamarta-001',
            nombre: 'ZF Santa Marta Industrial',
            ciudad: 'Santa Marta',
            distanciaAlPuertoKm: 4.1,
            capacidadTotalM2: 4200,
            ocupacionActualM2: 2100,
            precioPorDiaUSD: 160,
        },
    });
    const zfTocancipa = await prisma.zonaFranca.upsert({
        where: { id: 'zf-tocancipa-001' },
        update: {},
        create: {
            id: 'zf-tocancipa-001',
            nombre: 'ZF Tocancipá Zona Centro',
            ciudad: 'Tocancipá',
            distanciaAlPuertoKm: 180,
            capacidadTotalM2: 8000,
            ocupacionActualM2: 4800,
            precioPorDiaUSD: 145,
        },
    });
    console.log('✅ Zonas Francas creadas');
    const cliente1 = await prisma.cliente.upsert({
        where: { nit: '900.123.456-7' },
        update: {},
        create: {
            razonSocial: 'Textiles del Norte S.A.S',
            nit: '900.123.456-7',
            contactoPrincipal: 'María Torres',
            email: 'maria.torres@textilesnorte.co',
            telefono: '+57 301 234 5678',
            ciudad: 'Barranquilla',
        },
    });
    const cliente2 = await prisma.cliente.upsert({
        where: { nit: '800.987.654-3' },
        update: {},
        create: {
            razonSocial: 'Importaciones El Condor Ltda',
            nit: '800.987.654-3',
            contactoPrincipal: 'Carlos Mendoza',
            email: 'carlos@elcondor.com.co',
            telefono: '+57 316 789 0123',
            ciudad: 'Bogotá',
        },
    });
    const cliente3 = await prisma.cliente.upsert({
        where: { nit: '901.456.789-1' },
        update: {},
        create: {
            razonSocial: 'Agroquímicos Caribe S.A.',
            nit: '901.456.789-1',
            contactoPrincipal: 'Sofía Ramírez',
            email: 'sofia.ramirez@agroquimicoscaribe.co',
            telefono: '+57 300 567 8901',
            ciudad: 'Medellín',
        },
    });
    console.log('✅ Clientes creados');
    const op1 = await prisma.operacion.upsert({
        where: { codigo: 'FF-1001' },
        update: {},
        create: {
            codigo: 'FF-1001',
            clienteId: cliente1.id,
            tipo: 'IMPORTACION',
            paisOrigen: 'China',
            puertoEntrada: 'CTG',
            tipoContenedor: 'CONT_40',
            descripcionCarga: 'Rollos de tela sintética y accesorios textiles',
            pesoTon: 18.5,
            destinoFinal: 'Barranquilla, Atlántico',
            etaPuerto: new Date('2026-05-12'),
            estado: 'EN_PUERTO',
            zonaFrancaId: zfCartagena.id,
            creadoPor: operador.id,
        },
    });
    const op2 = await prisma.operacion.upsert({
        where: { codigo: 'FF-1002' },
        update: {},
        create: {
            codigo: 'FF-1002',
            clienteId: cliente2.id,
            tipo: 'IMPORTACION',
            paisOrigen: 'Estados Unidos',
            puertoEntrada: 'CTG',
            tipoContenedor: 'CONT_20',
            descripcionCarga: 'Maquinaria industrial para procesamiento de alimentos',
            pesoTon: 8.2,
            destinoFinal: 'Bogotá D.C.',
            etaPuerto: new Date('2026-05-20'),
            estado: 'CONFIRMADA',
            creadoPor: operador.id,
        },
    });
    const op3 = await prisma.operacion.upsert({
        where: { codigo: 'FF-1003' },
        update: {},
        create: {
            codigo: 'FF-1003',
            clienteId: cliente3.id,
            tipo: 'IMPORTACION',
            paisOrigen: 'Alemania',
            puertoEntrada: 'SMR',
            tipoContenedor: 'CONT_20',
            descripcionCarga: 'Fertilizantes y agroquímicos especializados',
            pesoTon: 12.0,
            destinoFinal: 'Medellín, Antioquia',
            etaPuerto: new Date('2026-05-28'),
            estado: 'BORRADOR',
            creadoPor: admin.id,
        },
    });
    console.log('✅ Operaciones de ejemplo creadas');
    console.log('\n🎉 Base de datos lista!\n');
    console.log('📧 Admin:    admin@vexa.co    / Admin2026!');
    console.log('📧 Operador: operador@vexa.co / Operador2026!\n');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map