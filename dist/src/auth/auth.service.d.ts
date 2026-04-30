import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(email: string, password: string): Promise<{
        token: string;
        usuario: {
            id: string;
            nombre: string;
            email: string;
            rol: import(".prisma/client").$Enums.Rol;
        };
    }>;
    crearUsuario(data: {
        nombre: string;
        email: string;
        password: string;
        rol?: any;
    }): Promise<{
        id: string;
        email: string;
        nombre: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
        creadoEn: Date;
    }>;
    validarToken(payload: any): Promise<{
        id: string;
        email: string;
        nombre: string;
        password: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
        creadoEn: Date;
    } | null>;
}
