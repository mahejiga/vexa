-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('BL', 'AWB', 'PACKING_LIST', 'FACTURA_COMERCIAL', 'CERTIFICADO_ORIGEN', 'SEGURO', 'DTA', 'PERMISO_IMPORTACION', 'INSPECCION_FISICA', 'CARTA_PORTE', 'OTRO');

-- CreateTable
CREATE TABLE "documentos_embarque" (
    "id" TEXT NOT NULL,
    "operacionId" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "nombre" TEXT NOT NULL,
    "numero" TEXT,
    "fechaEmision" TIMESTAMP(3),
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_embarque_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documentos_embarque" ADD CONSTRAINT "documentos_embarque_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
