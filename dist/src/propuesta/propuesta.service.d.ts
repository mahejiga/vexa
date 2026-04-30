import { PrismaService } from '../prisma/prisma.service';
export declare class PropuestaService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generarPdf(operacionId: string): Promise<Buffer>;
}
