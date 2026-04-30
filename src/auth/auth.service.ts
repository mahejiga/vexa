import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.activo) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(password, usuario.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    const token = this.jwt.sign(payload);

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  async crearUsuario(data: { nombre: string; email: string; password: string; rol?: any }) {
    const existe = await this.prisma.usuario.findUnique({ where: { email: data.email } });
    if (existe) throw new ConflictException('El email ya está registrado');

    const hash = await bcrypt.hash(data.password, 10);
    const usuario = await this.prisma.usuario.create({
      data: { ...data, password: hash },
    });

    const { password: _, ...resultado } = usuario;
    return resultado;
  }

  async validarToken(payload: any) {
    return this.prisma.usuario.findUnique({ where: { id: payload.sub } });
  }
}
