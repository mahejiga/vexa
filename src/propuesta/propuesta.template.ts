export interface PropuestaData {
  numeroCotizacion: string;
  fecha: string;
  validaHasta: string;
  // Cliente
  clienteNombre: string;
  clienteNit?: string;
  clienteContacto?: string;
  clienteEmail?: string;
  // Operación
  operacionCodigo: string;
  tipo: string;
  paisOrigen: string;
  puertoEntrada: string;
  tipoContenedor: string;
  descripcionCarga: string;
  pesoTon: number;
  destinoFinal: string;
  etaPuerto: string;
  // Naviera seleccionada
  navieraNombre?: string;
  navieraTarifaUSD?: number;
  navieraTiempoTransito?: number;
  navieraDisponibilidad?: string;
  // Zona Franca
  zonaFrancaNombre?: string;
  zonaFrancaCiudad?: string;
  zonaFrancaDias?: number;
  zonaFrancaPrecioDiaUSD?: number;
  zonaFrancaTotalUSD?: number;
  // Transporte
  transporteCarrier?: string;
  transporteRuta?: string;
  transportePrecioCOP?: number;
  transportePrecioUSD?: number;
  // Totales
  trmDelDia: number;
  subtotalNavieraUSD: number;
  subtotalZFUSD: number;
  subtotalTransporteUSD: number;
  totalUSD: number;
  totalCOP: number;
  // Notas
  notasAdicionales?: string;
}

export function generarHtmlPropuesta(d: PropuestaData): string {
  const fmt = (n: number, dec = 0) =>
    n.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  const filaDos = (label: string, val: string) => `
    <tr>
      <td class="td-label">${label}</td>
      <td class="td-val">${val}</td>
    </tr>`;

  const tipoLabel: Record<string, string> = {
    IMPORTACION: 'Importación', EXPORTACION: 'Exportación', TRANSITO: 'Tránsito',
  };
  const contenedorLabel: Record<string, string> = {
    CONT_20: "Contenedor 20'", CONT_40: "Contenedor 40'",
    CONT_40HC: "Contenedor 40' HC", LCL: 'LCL', AEREO: 'Carga aérea', OTRO: 'Otro',
  };
  const puertoLabel: Record<string, string> = {
    CTG: 'Cartagena — SPRC', SMR: 'Santa Marta — SPRB',
    BOG: 'Bogotá — El Dorado', OTRO: 'Por confirmar',
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', sans-serif;
    background: white;
    color: #1a1a2e;
    font-size: 10pt;
    line-height: 1.5;
  }

  /* ── HEADER ─────────────────────────────────────────────── */
  .header {
    background: linear-gradient(135deg, #071436 0%, #0a1f4e 60%, #0d2a6b 100%);
    padding: 36px 48px 32px;
    position: relative;
    overflow: hidden;
  }

  .header::after {
    content: '';
    position: absolute;
    bottom: -40px; right: -40px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%);
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-mark {
    width: 48px;
    height: 48px;
  }

  .logo-text {
    font-size: 28pt;
    font-weight: 700;
    color: white;
    letter-spacing: 0.12em;
    line-height: 1;
  }

  .logo-sub {
    font-size: 8pt;
    color: #60a5fa;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 3px;
  }

  .doc-meta {
    text-align: right;
  }

  .doc-meta-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7pt;
    color: rgba(255,255,255,0.45);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .doc-meta-val {
    font-size: 10pt;
    color: rgba(255,255,255,0.9);
    font-weight: 500;
  }

  .doc-meta-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14pt;
    font-weight: 600;
    color: #86efac;
    margin-top: 4px;
  }

  .header-bottom {
    border-top: 1px solid rgba(255,255,255,0.12);
    padding-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .title-block {}
  .prop-title {
    font-size: 20pt;
    font-weight: 300;
    color: white;
    letter-spacing: -0.01em;
    line-height: 1.1;
  }
  .prop-title strong { font-weight: 700; color: #86efac; }

  .validity {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.5pt;
    color: rgba(255,255,255,0.5);
    text-align: right;
    line-height: 1.6;
  }

  /* ── BODY ─────────────────────────────────────────────────── */
  .body { padding: 0 48px 40px; }

  /* ── SECTION ──────────────────────────────────────────────── */
  .section { margin-top: 28px; }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #0a1f4e;
  }

  .section-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8pt;
    font-weight: 600;
    color: white;
    background: #0a1f4e;
    padding: 3px 8px;
    border-radius: 3px;
  }

  .section-title {
    font-size: 12pt;
    font-weight: 600;
    color: #0a1f4e;
  }

  /* ── TABLES ──────────────────────────────────────────────── */
  .info-table { width: 100%; border-collapse: collapse; }

  .td-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.5pt;
    color: #6b7280;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 12px 6px 0;
    width: 38%;
    vertical-align: top;
    border-bottom: 1px solid #f3f4f6;
  }

  .td-val {
    font-size: 9.5pt;
    color: #1f2937;
    padding: 6px 0;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: top;
  }

  td.td-val strong { font-weight: 600; color: #111827; }

  /* ── SERVICE CARDS ───────────────────────────────────────── */
  .services-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-top: 12px;
  }

  .service-card {
    border: 1px solid #e5e7eb;
    border-top: 3px solid #0a1f4e;
    padding: 14px;
    border-radius: 4px;
    background: #f9fafb;
  }

  .service-card.green { border-top-color: #16a34a; }
  .service-card.sky { border-top-color: #0284c7; }

  .sc-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7pt;
    font-weight: 600;
    color: #6b7280;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .sc-name { font-size: 10pt; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .sc-detail { font-size: 8.5pt; color: #6b7280; line-height: 1.6; margin-bottom: 8px; }
  .sc-price {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13pt;
    font-weight: 700;
    color: #0a1f4e;
  }
  .sc-price.green { color: #16a34a; }

  /* ── TOTALS ─────────────────────────────────────────────── */
  .totals-box {
    background: linear-gradient(135deg, #071436 0%, #0a1f4e 100%);
    border-radius: 6px;
    padding: 22px 28px;
    margin-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .totals-breakdown { display: flex; flex-direction: column; gap: 5px; }
  .tb-row { display: flex; justify-content: space-between; gap: 40px; }
  .tb-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.5pt;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .tb-amount {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9pt;
    color: rgba(255,255,255,0.85);
    font-weight: 600;
  }
  .tb-divider { border: none; border-top: 1px solid rgba(255,255,255,0.12); margin: 8px 0; }

  .totals-main { text-align: right; }
  .tm-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.5pt;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .tm-usd {
    font-size: 26pt;
    font-weight: 700;
    color: #86efac;
    font-family: 'JetBrains Mono', monospace;
    line-height: 1;
  }
  .tm-cop {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10pt;
    color: rgba(255,255,255,0.6);
    margin-top: 4px;
  }
  .tm-trm {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7pt;
    color: rgba(255,255,255,0.35);
    margin-top: 3px;
  }

  /* ── CONDITIONS ─────────────────────────────────────────── */
  .conditions {
    margin-top: 20px;
    padding: 14px 18px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-left: 4px solid #0284c7;
    border-radius: 3px;
  }

  .cond-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.5pt;
    font-weight: 600;
    color: #0369a1;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .cond-list { list-style: none; padding: 0; }
  .cond-list li {
    font-size: 8.5pt;
    color: #374151;
    padding: 3px 0;
    padding-left: 14px;
    position: relative;
  }
  .cond-list li::before {
    content: '·';
    position: absolute;
    left: 0;
    color: #0284c7;
    font-weight: 700;
  }

  /* ── FOOTER ─────────────────────────────────────────────── */
  .footer {
    margin-top: 28px;
    padding: 16px 48px;
    background: #071436;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer-left {
    font-family: 'JetBrains Mono', monospace;
    font-size: 7.5pt;
    color: rgba(255,255,255,0.35);
    line-height: 1.7;
  }

  .footer-right {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8pt;
    color: #60a5fa;
    font-weight: 600;
    letter-spacing: 0.15em;
  }

  .no-service {
    color: #9ca3af;
    font-style: italic;
    font-size: 9pt;
    padding: 8px 0;
  }
</style>
</head>
<body>

<!-- ══ HEADER ══════════════════════════════════════════════════════════ -->
<div class="header">
  <div class="header-top">
    <div class="logo">
      <svg class="logo-mark" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="10" fill="#0a1f4e"/>
        <path d="M9 13 L24 36 L39 13" stroke="white" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M18.5 21 L24 36 L29.5 21" stroke="#22c55e" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      </svg>
      <div>
        <div class="logo-text">VEXA</div>
        <div class="logo-sub">AI global freight</div>
      </div>
    </div>
    <div class="doc-meta">
      <div class="doc-meta-label">Propuesta Comercial</div>
      <div class="doc-meta-val">${d.fecha}</div>
      <div class="doc-meta-num">${d.numeroCotizacion}</div>
    </div>
  </div>
  <div class="header-bottom">
    <div class="title-block">
      <div class="prop-title">Propuesta integral para<br><strong>${d.clienteNombre}</strong></div>
    </div>
    <div class="validity">
      Operación ${d.operacionCodigo}<br>
      Válida hasta: ${d.validaHasta}<br>
      ${tipoLabel[d.tipo] || d.tipo} · ${contenedorLabel[d.tipoContenedor] || d.tipoContenedor}
    </div>
  </div>
</div>

<!-- ══ BODY ════════════════════════════════════════════════════════════ -->
<div class="body">

  <!-- 01 Cliente -->
  <div class="section">
    <div class="section-header">
      <span class="section-num">01</span>
      <span class="section-title">Datos del Cliente</span>
    </div>
    <table class="info-table">
      ${filaDos('Razón social', `<strong>${d.clienteNombre}</strong>`)}
      ${d.clienteNit ? filaDos('NIT', d.clienteNit) : ''}
      ${d.clienteContacto ? filaDos('Contacto', d.clienteContacto) : ''}
      ${d.clienteEmail ? filaDos('Email', d.clienteEmail) : ''}
    </table>
  </div>

  <!-- 02 Operación -->
  <div class="section">
    <div class="section-header">
      <span class="section-num">02</span>
      <span class="section-title">Detalles de la Operación</span>
    </div>
    <table class="info-table">
      ${filaDos('Tipo de operación', tipoLabel[d.tipo] || d.tipo)}
      ${filaDos('Origen', d.paisOrigen)}
      ${filaDos('Puerto de entrada', puertoLabel[d.puertoEntrada] || d.puertoEntrada)}
      ${filaDos('Tipo de carga', contenedorLabel[d.tipoContenedor] || d.tipoContenedor)}
      ${filaDos('Descripción', d.descripcionCarga)}
      ${filaDos('Peso estimado', `${d.pesoTon} toneladas`)}
      ${filaDos('Destino final', d.destinoFinal)}
      ${filaDos('ETA Puerto', d.etaPuerto)}
    </table>
  </div>

  <!-- 03 Servicios -->
  <div class="section">
    <div class="section-header">
      <span class="section-num">03</span>
      <span class="section-title">Servicios Incluidos</span>
    </div>
    <div class="services-grid">

      <!-- Naviera -->
      <div class="service-card">
        <div class="sc-label">🚢 Flete Marítimo</div>
        ${d.navieraNombre ? `
          <div class="sc-name">${d.navieraNombre}</div>
          <div class="sc-detail">
            Tiempo de tránsito: ${d.navieraTiempoTransito ?? '—'} días<br>
            Disponibilidad: ${d.navieraDisponibilidad ?? 'por confirmar'}<br>
            ${d.puertoEntrada === 'CTG' ? 'Cartagena — SPRC' : 'Santa Marta — SPRB'}<br>
            Tarifa incluye: BAF, CAF y recargos base
          </div>
          <div class="sc-price">$${fmt(d.navieraTarifaUSD ?? 0)} USD</div>
        ` : '<div class="no-service">Por cotizar con naviera</div>'}
      </div>

      <!-- Zona Franca -->
      <div class="service-card green">
        <div class="sc-label">🏭 Almacenamiento en ZF</div>
        ${d.zonaFrancaNombre ? `
          <div class="sc-name">${d.zonaFrancaNombre}</div>
          <div class="sc-detail">
            ${d.zonaFrancaCiudad}<br>
            Días estimados: ${d.zonaFrancaDias ?? 15}<br>
            Tarifa: $${d.zonaFrancaPrecioDiaUSD ?? 0} USD/día<br>
            Régimen de Zona Franca
          </div>
          <div class="sc-price green">$${fmt(d.zonaFrancaTotalUSD ?? 0)} USD</div>
        ` : '<div class="no-service">Sin almacenamiento en ZF</div>'}
      </div>

      <!-- Transporte -->
      <div class="service-card sky">
        <div class="sc-label">🚛 Transporte Terrestre</div>
        ${d.transporteCarrier ? `
          <div class="sc-name">${d.transporteCarrier}</div>
          <div class="sc-detail">
            ${d.transporteRuta}<br>
            Tiempo estimado: ~18 horas<br>
            Unidad: ${d.tipoContenedor === 'CONT_40' || d.tipoContenedor === 'CONT_40HC' ? "Tracto 40'" : "Tracto 20'"}<br>
            Seguro de carga incluido
          </div>
          <div class="sc-price">$${fmt(d.transportePrecioUSD ?? 0)} USD</div>
        ` : '<div class="no-service">Sin transporte incluido</div>'}
      </div>

    </div>
  </div>

  <!-- 04 Totales -->
  <div class="totals-box">
    <div class="totals-breakdown">
      ${d.navieraTarifaUSD ? `<div class="tb-row"><span class="tb-label">Flete marítimo</span><span class="tb-amount">$${fmt(d.subtotalNavieraUSD)} USD</span></div>` : ''}
      ${d.zonaFrancaTotalUSD ? `<div class="tb-row"><span class="tb-label">Almacenamiento ZF</span><span class="tb-amount">$${fmt(d.subtotalZFUSD)} USD</span></div>` : ''}
      ${d.transportePrecioUSD ? `<div class="tb-row"><span class="tb-label">Transporte terrestre</span><span class="tb-amount">$${fmt(d.subtotalTransporteUSD)} USD</span></div>` : ''}
      <hr class="tb-divider">
      <div class="tb-row">
        <span class="tb-label" style="color:rgba(255,255,255,0.7)">Total general</span>
        <span class="tb-amount" style="color:#86efac">$${fmt(d.totalUSD)} USD</span>
      </div>
    </div>
    <div class="totals-main">
      <div class="tm-label">Total estimado</div>
      <div class="tm-usd">$${fmt(d.totalUSD)}</div>
      <div class="tm-cop">≈ COP ${fmt(d.totalCOP)}</div>
      <div class="tm-trm">TRM ref: $${fmt(d.trmDelDia)} COP/USD</div>
    </div>
  </div>

  <!-- Condiciones -->
  <div class="conditions">
    <div class="cond-title">Condiciones de esta propuesta</div>
    <ul class="cond-list">
      <li>Cotización válida hasta el ${d.validaHasta}. Sujeta a disponibilidad de espacio en naviera y zona franca.</li>
      <li>Los precios de flete marítimo pueden variar por ajustes de combustible (BAF) o peak season surcharge.</li>
      <li>El costo de almacenamiento en ZF se calcula sobre días estimados. Se factura por días reales.</li>
      <li>El tipo de cambio de referencia (TRM) es el vigente al día de generación de esta propuesta.</li>
      <li>No incluye: aranceles, IVA, gastos de aduana, aforo, honorarios de agenciamiento aduanal.</li>
      ${d.notasAdicionales ? `<li>${d.notasAdicionales}</li>` : ''}
    </ul>
  </div>

</div><!-- end body -->

<!-- ══ FOOTER ═══════════════════════════════════════════════════════════ -->
<div class="footer">
  <div class="footer-left">
    VEXA · AI global freight · ${d.numeroCotizacion}<br>
    Generado el ${d.fecha} · Documento confidencial
  </div>
  <div class="footer-right">vexa.co</div>
</div>

</body>
</html>`;
}
