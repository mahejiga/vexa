import type { Response } from 'express';
import { PropuestaService } from './propuesta.service';
export declare class PropuestaController {
    private readonly propuestaService;
    constructor(propuestaService: PropuestaService);
    descargarPdf(operacionId: string, res: Response): Promise<void>;
}
