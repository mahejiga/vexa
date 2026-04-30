"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTAINER_ISO = exports.UNLOCODE = void 0;
exports.estimatedRate = estimatedRate;
exports.UNLOCODE = {
    CNSHA: 'CNSHA',
    CNNGB: 'CNNGB',
    CNQIN: 'CNQIN',
    DEHAM: 'DEHAM',
    NLRTM: 'NLRTM',
    ESVLC: 'ESVLC',
    ESBCN: 'ESBCN',
    USNYC: 'USNYC',
    USHOU: 'USHOU',
    USSAV: 'USSAV',
    USCHA: 'USCHA',
    USMIA: 'USMIA',
    USNFK: 'USNFK',
    MXZLO: 'MXZLO',
    MXVER: 'MXVER',
    MXLZC: 'MXLZC',
    GTSTC: 'GTSTC',
    COCTG: 'COCTG',
    COSNR: 'COSMR',
    COBUN: 'COBUN',
    COBAQ: 'COBAQ',
};
exports.CONTAINER_ISO = {
    CONT_20: { maersk: '22G1', hapag: '20DC', cma: '20DRY', label: "20' DC" },
    CONT_40: { maersk: '42G1', hapag: '40DC', cma: '40DRY', label: "40' DC" },
    CONT_40HC: { maersk: 'L5G1', hapag: '40HC', cma: '40HC', label: "40' HC" },
    LCL: { maersk: 'LCL', hapag: 'LCL', cma: 'LCL', label: 'LCL' },
};
function estimatedRate(nombre, origen, tipoCarga, index) {
    const BASE = { CONT_20: 1800, CONT_40: 3200, CONT_40HC: 3500, LCL: 850 };
    const FACTOR = {
        CNSHA: 1.0, CNNGB: 0.98, CNQIN: 1.02,
        USNYC: 0.85, USHOU: 0.82,
        DEHAM: 0.78, NLRTM: 0.76, ESVLC: 0.72,
    };
    const base = BASE[tipoCarga] ?? 2000;
    const factor = FACTOR[origen] ?? 1.0;
    return {
        naviera: nombre,
        tarifaUSD: Math.round(base * factor * (0.88 + index * 0.05)),
        tiempoTransitoD: 22 + index * 2,
        disponibilidad: ['alta', 'alta', 'media', 'alta', 'media', 'limitada'][index % 6],
        fuente: 'estimado',
    };
}
//# sourceMappingURL=carrier.interface.js.map