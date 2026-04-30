import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async findAll(busqueda?: string) {
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

  async findOne(id: string) {
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
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async create(data: {
    razonSocial: string;
    nit?: string;
    contactoPrincipal?: string;
    email?: string;
    telefono?: string;
    ciudad?: string;
  }) {
    return this.prisma.cliente.create({ data });
  }

  async update(id: string, data: Partial<{
    razonSocial: string;
    nit: string;
    contactoPrincipal: string;
    email: string;
    telefono: string;
    ciudad: string;
    activo: boolean;
  }>) {
    await this.findOne(id);
    return this.prisma.cliente.update({ where: { id }, data });
  }
}
