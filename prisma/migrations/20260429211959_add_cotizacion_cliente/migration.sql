-- AlterTable
ALTER TABLE "cotizaciones_navieras" ADD COLUMN     "clienteId" TEXT,
ADD COLUMN     "numeroCotizacion" TEXT;

-- AddForeignKey
ALTER TABLE "cotizaciones_navieras" ADD CONSTRAINT "cotizaciones_navieras_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
