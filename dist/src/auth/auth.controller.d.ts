import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        token: string;
        usuario: {
            id: string;
            nombre: string;
            email: string;
            rol: import(".prisma/client").$Enums.Rol;
        };
    }>;
    me(req: any): any;
}
