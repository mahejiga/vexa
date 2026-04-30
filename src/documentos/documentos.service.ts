import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TipoDocumento } from '@prisma/client';

@Injectable()
export class DocumentosService {
  constructor(private prisma: PrismaService) {}

  async findByOperacion(operacionId: string) {
    return this.prisma.documentoEmbarque.findMany({
      where: { operacionId },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async create(data: {
    operacionId: string;
    tipo: TipoDocumento;
    nombre: string;
    numero?: string;
    fechaEmision?: Date;
    observaciones?: string;
  }) {
    return this.prisma.documentoEmbarque.create({ data });
  }

  async update(id: string, data: {
    nombre?: string;
    numero?: string;
    fechaEmision?: Date;
    observaciones?: string;
  }) {
    const doc = await this.prisma.documentoEmbarque.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return this.prisma.documentoEmbarque.update({ where: { id }, data });
  }

  async remove(id: string) {
    const doc = await this.prisma.documentoEmbarque.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return this.prisma.documentoEmbarque.delete({ where: { id } });
  }
}
