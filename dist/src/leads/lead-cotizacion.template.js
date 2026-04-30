"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarHtmlCotizacion = generarHtmlCotizacion;
const LABEL_CONTENEDOR = {
    CONT_20: "Contenedor 20' DC",
    CONT_40: "Contenedor 40' DC",
    CONT_40HC: "Contenedor 40' HC",
    LCL: 'LCL — Carga suelta',
};
const LABEL_DISP = {
    alta: 'Alta',
    media: 'Media',
    limitada: 'Limitada',
};
const COLOR_DISP = {
    alta: '#16a34a',
    media: '#d97706',
    limitada: '#dc2626',
};
function generarHtmlCotizacion(d) {
    const tarifasRows = d.tarifas
        .map((t, i) => `
    <tr style="background:${i % 2 === 0 ? '#f9fafb' : '#fff'}; ${i === 0 ? 'font-weight:600;' : ''}">
      <td style="padding:10px 14px; border-bottom:1px solid #e5e7eb; font-size:13px; color:#111827;">
        ${t.naviera}
        ${i === 0 ? '<span style="margin-left:6px; background:#dcfce7; color:#15803d; font-size:10px; padding:2px 7px; border-radius:9px; font-weight:600;">MEJOR PRECIO</span>' : ''}
      </td>
      <td style="padding:10px 14px; border-bottom:1px solid #e5e7eb; font-size:13px; color:#111827; text-align:right;">
        <strong>$${t.tarifaUSD.toLocaleString('es-CO')}</strong> USD
        ${t.fuente === 'estimado' ? '<div style="font-size:10px; color:#9ca3af; font-weight:400;">precio de referencia</div>' : ''}
      </td>
      <td style="padding:10px 14px; border-bottom:1px solid #e5e7eb; font-size:12px; color:#6b7280; text-align:center;">
        ${t.tiempoTransitoD} días
      </td>
      <td style="padding:10px 14px; border-bottom:1px solid #e5e7eb; font-size:12px; text-align:center;">
        <span style="color:${COLOR_DISP[t.disponibilidad] ?? '#374151'};">${LABEL_DISP[t.disponibilidad] ?? t.disponibilidad}</span>
      </td>
    </tr>`)
        .join('');
    const estimadoAviso = d.esEstimado
        ? `<div style="margin:20px 0; padding:12px 16px; background:#fffbeb; border-left:4px solid #f59e0b; border-radius:4px; font-size:12px; color:#92400e; line-height:1.6;">
        <strong>Aviso importante:</strong> Las tarifas presentadas son de referencia estimada. Nuestro equipo validará los precios reales con cada naviera antes de emitir la propuesta comercial formal.
      </div>`
        : '';
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #fff; color: #111827; }
    .page { max-width: 820px; margin: 0 auto; padding: 40px 48px; }
    h2 { font-size: 18px; color: #111827; margin-bottom: 4px; }
    h3 { font-size: 13px; color: #6b7280; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 12px; margin-top: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #0f172a; color: #fff; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .07em; padding: 9px 14px; text-align: left; }
    th:not(:first-child) { text-align: center; }
    .label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 2px; }
    .value { font-size: 13px; color: #111827; font-weight: 500; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 20px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; }
    .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; line-height: 1.6; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div style="display:flex; align-items:flex-start; justify-content:space-between; padding-bottom:24px; border-bottom:2px solid #0f172a; margin-bottom:28px;">
    <div>
      <div style="font-size:28px; font-weight:900; letter-spacing:-0.5px; color:#0f172a;">VEXA</div>
      <div style="font-size:11px; color:#22c55e; font-weight:600; letter-spacing:.1em; text-transform:uppercase;">AI Global Freight · Colombia</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px; color:#9ca3af; text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px;">Cotización</div>
      <div style="font-size:20px; font-weight:800; color:#0f172a; letter-spacing:.05em;">${d.numeroCotizacion}</div>
      <div style="font-size:12px; color:#6b7280; margin-top:4px;">Emitida: ${d.fecha}</div>
      <div style="font-size:12px; color:#6b7280;">Válida hasta: ${d.validaHasta}</div>
    </div>
  </div>

  <!-- Cliente + Ruta -->
  <div class="grid2">
    <div>
      <h3>Cliente</h3>
      <div class="card">
        <div class="label">Empresa / Contacto</div>
        <div class="value" style="font-size:15px; margin-bottom:8px;">${d.clienteNombre}</div>
        ${d.clienteContacto ? `<div class="label">Persona de contacto</div><div class="value" style="margin-bottom:6px;">${d.clienteContacto}</div>` : ''}
        ${d.clienteEmail ? `<div class="label">Email</div><div class="value" style="margin-bottom:6px;">${d.clienteEmail}</div>` : ''}
        ${d.clienteTelefono ? `<div class="label">Teléfono</div><div class="value">${d.clienteTelefono}</div>` : ''}
      </div>
    </div>
    <div>
      <h3>Ruta y Carga</h3>
      <div class="card">
        <div class="label">Puerto de Origen</div>
        <div class="value" style="margin-bottom:8px;">${d.puertoOrigen}</div>
        <div class="label">Puerto de Destino</div>
        <div class="value" style="margin-bottom:8px;">${d.puertoDestino}</div>
        <div class="label">Tipo de Equipo</div>
        <div class="value" style="margin-bottom:8px;">${LABEL_CONTENEDOR[d.tipoContenedor] ?? d.tipoContenedor}</div>
        ${d.tipoMercancia ? `<div class="label">Tipo de Mercancía</div><div class="value" style="margin-bottom:6px;">${d.tipoMercancia}</div>` : ''}
        ${d.descripcionCarga ? `<div class="label">Descripción</div><div class="value" style="font-size:12px; color:#374151;">${d.descripcionCarga}</div>` : ''}
      </div>
    </div>
  </div>

  <!-- Aviso estimado -->
  ${estimadoAviso}

  <!-- Tarifas -->
  <h3 style="margin-top:28px;">Tarifas de Navieras Consultadas</h3>
  <table>
    <thead>
      <tr>
        <th>Naviera</th>
        <th style="text-align:right;">Tarifa</th>
        <th style="text-align:center;">Tránsito</th>
        <th style="text-align:center;">Disponibilidad</th>
      </tr>
    </thead>
    <tbody>
      ${tarifasRows}
    </tbody>
  </table>

  <!-- Nota -->
  <div style="margin-top:20px; padding:12px 16px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; font-size:12px; color:#166534; line-height:1.6;">
    <strong>Para confirmar su cotización:</strong> Responda este correo indicando la naviera de su preferencia o contáctenos al equipo comercial de VEXA. Una vez confirmada la selección, emitiremos la propuesta comercial formal con todos los detalles del servicio integral.
  </div>

  <!-- Footer -->
  <div class="footer">
    VEXA — AI Global Freight · Colombia<br/>
    Esta cotización es de carácter informativo y está sujeta a disponibilidad y confirmación de tarifas.<br/>
    Válida por 48 horas desde la fecha de emisión.
  </div>

</div>
</body>
</html>`;
}
//# sourceMappingURL=lead-cotizacion.template.js.map