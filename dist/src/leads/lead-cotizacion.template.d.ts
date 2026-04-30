export interface LeadCotizacionData {
    numeroCotizacion: string;
    fecha: string;
    validaHasta: string;
    clienteNombre: string;
    clienteContacto?: string;
    clienteEmail?: string;
    clienteTelefono?: string;
    puertoOrigen: string;
    puertoDestino: string;
    tipoContenedor: string;
    tipoMercancia?: string;
    descripcionCarga?: string;
    esEstimado: boolean;
    tarifas: Array<{
        naviera: string;
        tarifaUSD: number;
        tiempoTransitoD: number;
        disponibilidad: string;
        fuente: string;
    }>;
}
export declare function generarHtmlCotizacion(d: LeadCotizacionData): string;
