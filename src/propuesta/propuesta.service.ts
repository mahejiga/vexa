import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generarHtmlPropuesta, PropuestaData } from './propuesta.template';

@Injectable()
export class PropuestaService {
  constructor(private readonly prisma: PrismaService) {}

  async generarPdf(operacionId: string): Promise<Buffer> {
    const op = await this.prisma.operacion.findUnique({
      where: { id: operacionId },
      include: {
        cliente: true,
        zonaFranca: true,
        sugerencias: true,
        cotizaciones: { orderBy: { creadoEn: 'desc' }, take: 1 },
        transporte: true,
        creador: true,
      },
    });

    if (!op) throw new NotFoundException('Operación no encontrada');

    // TRM de referencia (actualizada manualmente o via API)
    const TRM = 4_250;

    const cotNav = op.cotizaciones?.[0];
    const transporte = op.transporte;

    const navieraTarifaUSD = cotNav?.tarifaUSD ?? 0;
    const zonaFrancaDias = 15;
    const zonaFrancaTotalUSD = op.zonaFranca
      ? op.zonaFranca.precioPorDiaUSD * zonaFrancaDias
      : 0;
    const transportePrecioUSD = transporte?.precioOfertado
      ? transporte.precioOfertado / TRM
      : 0;

    const totalUSD = navieraTarifaUSD + zonaFrancaTotalUSD + transportePrecioUSD;

    const numeroCotizacion = `VX-${op.codigo}-${new Date().getFullYear()}`;
    const hoy = new Date();
    const validaHasta = new Date(hoy);
    validaHasta.setDate(validaHasta.getDate() + 15);

    const fmt = (d: Date) =>
      d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });

    const data: PropuestaData = {
      numeroCotizacion,
      fecha: fmt(hoy),
      validaHasta: fmt(validaHasta),
      // Cliente
      clienteNombre: op.cliente?.razonSocial ?? '—',
      clienteNit: op.cliente?.nit ?? undefined,
      clienteContacto: op.cliente?.contactoPrincipal ?? undefined,
      clienteEmail: op.cliente?.email ?? undefined,
      // Operación
      operacionCodigo: op.codigo,
      tipo: op.tipo,
      paisOrigen: op.paisOrigen,
      puertoEntrada: op.puertoEntrada,
      tipoContenedor: op.tipoContenedor,
      descripcionCarga: op.descripcionCarga,
      pesoTon: op.pesoTon ?? 0,
      destinoFinal: op.destinoFinal ?? '—',
      etaPuerto: op.etaPuerto
        ? new Date(op.etaPuerto).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
        : 'Por confirmar',
      // Naviera
      navieraNombre: cotNav?.naviera ?? op.navieraActual ?? undefined,
      navieraTarifaUSD: navieraTarifaUSD || undefined,
      navieraTiempoTransito: cotNav?.tiempoTransitoD ?? undefined,
      navieraDisponibilidad: cotNav?.disponibilidad ?? undefined,
      // Zona Franca
      zonaFrancaNombre: op.zonaFranca?.nombre ?? undefined,
      zonaFrancaCiudad: op.zonaFranca?.ciudad ?? undefined,
      zonaFrancaDias: zonaFrancaDias,
      zonaFrancaPrecioDiaUSD: op.zonaFranca?.precioPorDiaUSD ?? undefined,
      zonaFrancaTotalUSD: zonaFrancaTotalUSD || undefined,
      // Transporte
      transporteCarrier: transporte?.carrier ?? undefined,
      transporteRuta: transporte ? `${transporte.origen} → ${transporte.destino}` : undefined,
      transportePrecioCOP: transporte?.precioOfertado ?? undefined,
      transportePrecioUSD: transportePrecioUSD || undefined,
      // Totales
      trmDelDia: TRM,
      subtotalNavieraUSD: navieraTarifaUSD,
      subtotalZFUSD: zonaFrancaTotalUSD,
      subtotalTransporteUSD: transportePrecioUSD,
      totalUSD,
      totalCOP: totalUSD * TRM,
    };

    const html = generarHtmlPropuesta(data);

    // Lazy-load puppeteer para no bloquear el arranque
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
      ],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    await browser.close();

    return Buffer.from(pdf);
  }
}
