-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'OPERADOR_FREIGHT', 'OPERADOR_ZF', 'GERENTE');

-- CreateEnum
CREATE TYPE "TipoOperacion" AS ENUM ('IMPORTACION', 'EXPORTACION', 'TRANSITO');

-- CreateEnum
CREATE TYPE "PuertoEntrada" AS ENUM ('CTG', 'SMR', 'BOG', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoContenedor" AS ENUM ('CONT_20', 'CONT_40', 'CONT_40HC', 'LCL', 'AEREO', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoOperacion" AS ENUM ('BORRADOR', 'CONFIRMADA', 'EN_TRANSITO_ORIGEN', 'EN_PUERTO', 'EN_ZONA_FRANCA', 'EN_TRANSITO_DESTINO', 'ENTREGADA', 'CERRADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'OPERADOR_FREIGHT',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "nit" TEXT,
    "contactoPrincipal" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "ciudad" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zonas_francas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "distanciaAlPuertoKm" DOUBLE PRECISION NOT NULL,
    "capacidadTotalM2" DOUBLE PRECISION NOT NULL,
    "ocupacionActualM2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precioPorDiaUSD" DOUBLE PRECISION NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "ultimaSincronizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zonas_francas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargas_en_zf" (
    "id" TEXT NOT NULL,
    "zonaFrancaId" TEXT NOT NULL,
    "operacionId" TEXT,
    "descripcion" TEXT NOT NULL,
    "m2Ocupados" DOUBLE PRECISION NOT NULL,
    "fechaEntrada" TIMESTAMP(3) NOT NULL,
    "fechaSalidaEstimada" TIMESTAMP(3),
    "esClientePropio" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cargas_en_zf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operaciones" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipo" "TipoOperacion" NOT NULL,
    "paisOrigen" TEXT NOT NULL,
    "paisDestino" TEXT,
    "puertoEntrada" "PuertoEntrada" NOT NULL,
    "tipoContenedor" "TipoContenedor" NOT NULL,
    "descripcionCarga" TEXT NOT NULL,
    "pesoTon" DOUBLE PRECISION NOT NULL,
    "destinoFinal" TEXT NOT NULL,
    "etaPuerto" TIMESTAMP(3) NOT NULL,
    "numeroBlAwb" TEXT,
    "navieraActual" TEXT,
    "valorFobUSD" DOUBLE PRECISION,
    "notasInternas" TEXT,
    "estado" "EstadoOperacion" NOT NULL DEFAULT 'BORRADOR',
    "zonaFrancaId" TEXT,
    "creadoPor" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transportes_asignados" (
    "id" TEXT NOT NULL,
    "operacionId" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "esAldia" BOOLEAN NOT NULL DEFAULT true,
    "origen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "fechaDespacho" TIMESTAMP(3),
    "precioOfertado" DOUBLE PRECISION,
    "moneda" TEXT NOT NULL DEFAULT 'COP',
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "trackingId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transportes_asignados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones_navieras" (
    "id" TEXT NOT NULL,
    "operacionId" TEXT,
    "naviera" TEXT NOT NULL,
    "puertoOrigen" TEXT NOT NULL,
    "puertoDestino" TEXT NOT NULL,
    "tipoContenedor" TEXT NOT NULL,
    "tarifaUSD" DOUBLE PRECISION,
    "tiempoTransitoD" INTEGER,
    "validaHasta" TIMESTAMP(3),
    "disponibilidad" TEXT,
    "fuente" TEXT NOT NULL DEFAULT 'api',
    "seleccionada" BOOLEAN NOT NULL DEFAULT false,
    "rawResponse" JSONB,
    "error" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cotizaciones_navieras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sugerencias" (
    "id" TEXT NOT NULL,
    "operacionId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "valorUSD" DOUBLE PRECISION,
    "aceptada" BOOLEAN,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sugerencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propuestas_comerciales" (
    "id" TEXT NOT NULL,
    "operacionId" TEXT,
    "clienteNombre" TEXT NOT NULL,
    "navieraNombre" TEXT,
    "navieraTarifaUSD" DOUBLE PRECISION,
    "zonaFrancaNombre" TEXT,
    "zonaFrancaCosto" DOUBLE PRECISION,
    "transporteCosto" DOUBLE PRECISION,
    "transporteMoneda" TEXT,
    "trmDelDia" DOUBLE PRECISION,
    "totalUSD" DOUBLE PRECISION,
    "totalCOP" DOUBLE PRECISION,
    "pdfUrl" TEXT,
    "validaHasta" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "propuestas_comerciales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "operacionId" TEXT,
    "accion" TEXT NOT NULL,
    "detalle" JSONB,
    "ip" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_nit_key" ON "clientes"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "operaciones_codigo_key" ON "operaciones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "transportes_asignados_operacionId_key" ON "transportes_asignados"("operacionId");

-- AddForeignKey
ALTER TABLE "cargas_en_zf" ADD CONSTRAINT "cargas_en_zf_zonaFrancaId_fkey" FOREIGN KEY ("zonaFrancaId") REFERENCES "zonas_francas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargas_en_zf" ADD CONSTRAINT "cargas_en_zf_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_zonaFrancaId_fkey" FOREIGN KEY ("zonaFrancaId") REFERENCES "zonas_francas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_creadoPor_fkey" FOREIGN KEY ("creadoPor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transportes_asignados" ADD CONSTRAINT "transportes_asignados_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones_navieras" ADD CONSTRAINT "cotizaciones_navieras_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sugerencias" ADD CONSTRAINT "sugerencias_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
