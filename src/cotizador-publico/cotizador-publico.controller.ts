import { Controller, Post, Get, Body, Query, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MaerskService }     from './carriers/maersk.service';
import { HapagLloydService } from './carriers/hapag-lloyd.service';
import { CmaCgmService }     from './carriers/cma-cgm.service';
import { RateCacheService }  from './carriers/rate-cache.service';
import { UNLOCODE, estimatedRate, CarrierRate } from './carriers/carrier.interface';
import { PrismaService } from '../prisma/prisma.service';

const ESTIMATED_CARRIERS = [
  { name: 'Evergreen',    index: 3 },
  { name: 'Hamburg Süd',  index: 4 },
  { name: 'MSC',          index: 5 },
];

function generarNumeroCotizacion(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `VX-${year}-${rand}`;
}

@ApiTags('Cotizador Público')
@Controller('cotizador-publico')
export class CotizadorPublicoController {
  private readonly logger = new Logger(CotizadorPublicoController.name);

  constructor(
    private readonly maersk:    MaerskService,
    private readonly hapag:     HapagLloydService,
    private readonly cma:       CmaCgmService,
    private readonly rateCache: RateCacheService,
    private readonly prisma:    PrismaService,
  ) {}

  // ── Buscar cliente por email para auto-completar ─────────────────
  @Get('cliente')
  async buscarCliente(@Query('email') email: string) {
    if (!email) return null;
    const cliente = await this.prisma.cliente.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: {
        id: true,
        razonSocial: true,
        contactoPrincipal: true,
        email: true,
        telefono: true,
        ciudad: true,
        nit: true,
        cotizaciones: {
          orderBy: { creadoEn: 'desc' },
          take: 5,
          select: {
            numeroCotizacion: true,
            naviera: true,
            tarifaUSD: true,
            tipoContenedor: true,
            puertoOrigen: true,
            creadoEn: true,
            rawResponse: true,
          },
        },
      },
    });
    return cliente;
  }

  // ── Consultar tarifas ────────────────────────────────────────────
  @Post('consultar')
  async consultar(@Body() body: {
    origen:              string;
    destino:             string;
    tipoCarga:           string;
    tipoMercancia?:      string;
    descripcionCarga?:   string;
    empresa?:            string;
    contacto?:           string;
    email?:              string;
    telefono?:           string;
  }) {
    const { origen, destino, tipoCarga, empresa, contacto, email, telefono,
            tipoMercancia, descripcionCarga } = body;

    const originCode = UNLOCODE[origen] ?? origen;
    const destCode   = UNLOCODE[destino] ?? destino;
    const cacheKey   = this.rateCache.key(originCode, destCode, tipoCarga);

    const numeroCotizacion = generarNumeroCotizacion();

    if (empresa || email) {
      this.logger.log(`LEAD ${numeroCotizacion}: ${empresa ?? 'n/a'} | ${email ?? 'n/a'} | ${origen}→${destino} ${tipoCarga}`);
    }

    const cached = this.rateCache.get(cacheKey);
    if (cached && !empresa) {
      return { ok: true, tarifas: cached, numeroCotizacion, consultadoEn: new Date().toISOString(), fuente: 'cache' };
    }

    const query = { originUNLOCODE: originCode, destUNLOCODE: destCode, containerCode: tipoCarga };

    const [maerskResult, hapagResult, cmaResult] = await Promise.allSettled([
      this.maersk.getRate(query),
      this.hapag.getRate(query),
      this.cma.getRate(query),
    ]);

    const apiRates: CarrierRate[] = [
      maerskResult.status === 'fulfilled' ? maerskResult.value : estimatedRate('Maersk',      originCode, tipoCarga, 0),
      hapagResult.status  === 'fulfilled' ? hapagResult.value  : estimatedRate('Hapag-Lloyd', originCode, tipoCarga, 1),
      cmaResult.status    === 'fulfilled' ? cmaResult.value    : estimatedRate('CMA CGM',     originCode, tipoCarga, 2),
    ];

    const estimatedRates: CarrierRate[] = ESTIMATED_CARRIERS.map(c =>
      estimatedRate(c.name, originCode, tipoCarga, c.index),
    );

    const tarifas = [...apiRates, ...estimatedRates].sort((a, b) => a.tarifaUSD - b.tarifaUSD);
    this.rateCache.set(cacheKey, tarifas);

    // Guardar lead + historial de carga si hay datos de empresa
    if (empresa || email) {
      try {
        let cliente = email
          ? await this.prisma.cliente.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
          : null;

        if (!cliente) {
          cliente = await this.prisma.cliente.create({
            data: {
              razonSocial:       empresa ?? contacto ?? 'Lead sin nombre',
              email:             email ?? undefined,
              telefono:          telefono ?? undefined,
              contactoPrincipal: contacto ?? undefined,
              activo:            true,
            },
          });
          this.logger.log(`Nuevo cliente: ${cliente.id} — ${cliente.razonSocial}`);
        } else {
          await this.prisma.cliente.update({
            where: { id: cliente.id },
            data: {
              ...(empresa  && { razonSocial: empresa }),
              ...(telefono && { telefono }),
              ...(contacto && { contactoPrincipal: contacto }),
            },
          });
        }

        await Promise.all(
          tarifas.map((t) =>
            this.prisma.cotizacionNaviera.create({
              data: {
                numeroCotizacion,
                clienteId:       cliente!.id,
                naviera:         t.naviera,
                puertoOrigen:    originCode,
                puertoDestino:   destCode,
                tipoContenedor:  tipoCarga,
                tarifaUSD:       t.tarifaUSD,
                tiempoTransitoD: t.tiempoTransitoD,
                disponibilidad:  t.disponibilidad,
                fuente:          t.fuente,
                validaHasta:     new Date(Date.now() + 48 * 60 * 60 * 1000),
                // Guardamos la descripción de la carga en rawResponse
                rawResponse: {
                  tipoMercancia:    tipoMercancia   ?? null,
                  descripcionCarga: descripcionCarga ?? null,
                },
              },
            }),
          ),
        );
      } catch (err) {
        this.logger.error(`Error guardando lead: ${(err as Error).message}`);
      }
    }

    return { ok: true, tarifas, numeroCotizacion, consultadoEn: new Date().toISOString() };
  }
}
