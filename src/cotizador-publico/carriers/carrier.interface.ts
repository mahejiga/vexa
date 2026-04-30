export interface RateQuery {
  originUNLOCODE: string;   // e.g. "CNSHA"
  destUNLOCODE:   string;   // e.g. "COCTG"
  containerCode:  string;   // "CONT_20" | "CONT_40" | "CONT_40HC" | "LCL"
}

export interface CarrierRate {
  naviera:         string;
  tarifaUSD:       number;
  tiempoTransitoD: number;
  disponibilidad:  'alta' | 'media' | 'limitada';
  fuente:          'api' | 'estimado';
  validezHoras?:   number;   // cuántas horas es válida la tarifa
  servicio?:       string;   // nombre del servicio/loop
}

/** Interfaz que todo servicio de naviera debe implementar */
export interface CarrierService {
  readonly name: string;
  getRate(query: RateQuery): Promise<CarrierRate>;
}

/** Mapeo de nuestros códigos internos a UN/LOCODE estándar */
export const UNLOCODE: Record<string, string> = {
  // Asia
  CNSHA: 'CNSHA',  // Shanghai, China
  CNNGB: 'CNNGB',  // Ningbo, China
  CNQIN: 'CNQIN',  // Qingdao, China
  // Europa
  DEHAM: 'DEHAM',  // Hamburgo, Alemania
  NLRTM: 'NLRTM',  // Rotterdam, Países Bajos
  ESVLC: 'ESVLC',  // Valencia, España
  ESBCN: 'ESBCN',  // Barcelona, España
  // USA
  USNYC: 'USNYC',  // Nueva York
  USHOU: 'USHOU',  // Houston
  USSAV: 'USSAV',  // Savannah, Georgia
  USCHA: 'USCHA',  // Charleston, SC
  USMIA: 'USMIA',  // Miami, FL
  USNFK: 'USNFK',  // Norfolk, VA
  // México
  MXZLO: 'MXZLO',  // Manzanillo, México
  MXVER: 'MXVER',  // Veracruz, México
  MXLZC: 'MXLZC',  // Lázaro Cárdenas, México
  // Guatemala
  GTSTC: 'GTSTC',  // Santo Tomás de Castilla, Guatemala
  // Colombia — destinos
  COCTG: 'COCTG',  // Cartagena de Indias
  COSNR: 'COSMR',  // Santa Marta
  COBUN: 'COBUN',  // Buenaventura
  COBAQ: 'COBAQ',  // Barranquilla
};

/** Mapeo de nuestros tipos de carga a los códigos ISO de equipo */
export const CONTAINER_ISO: Record<string, { maersk: string; hapag: string; cma: string; label: string }> = {
  CONT_20:   { maersk: '22G1', hapag: '20DC', cma: '20DRY', label: "20' DC" },
  CONT_40:   { maersk: '42G1', hapag: '40DC', cma: '40DRY', label: "40' DC" },
  CONT_40HC: { maersk: 'L5G1', hapag: '40HC', cma: '40HC',  label: "40' HC" },
  LCL:       { maersk: 'LCL',  hapag: 'LCL',  cma: 'LCL',   label: 'LCL'    },
};

/** Devuelve una tarifa estimada cuando el API real no está disponible */
export function estimatedRate(
  nombre: string,
  origen: string,
  tipoCarga: string,
  index: number,
): CarrierRate {
  const BASE: Record<string, number> = { CONT_20: 1800, CONT_40: 3200, CONT_40HC: 3500, LCL: 850 };
  const FACTOR: Record<string, number> = {
    CNSHA: 1.0, CNNGB: 0.98, CNQIN: 1.02,
    USNYC: 0.85, USHOU: 0.82,
    DEHAM: 0.78, NLRTM: 0.76, ESVLC: 0.72,
  };
  const base   = BASE[tipoCarga] ?? 2000;
  const factor = FACTOR[origen]  ?? 1.0;
  return {
    naviera:         nombre,
    tarifaUSD:       Math.round(base * factor * (0.88 + index * 0.05)),
    tiempoTransitoD: 22 + index * 2,
    disponibilidad:  (['alta','alta','media','alta','media','limitada'] as const)[index % 6],
    fuente:          'estimado',
  };
}
