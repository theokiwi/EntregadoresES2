CREATE TABLE "desafios_localizacao" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "usuarioId" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "alvoId" TEXT NOT NULL,
  "expiraEm" TIMESTAMP(3) NOT NULL,
  "consumidoEm" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "desafios_localizacao_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "desafios_localizacao_usuarioId_alvoId_tipo_idx"
  ON "desafios_localizacao"("usuarioId", "alvoId", "tipo");
CREATE INDEX "desafios_localizacao_expiraEm_idx"
  ON "desafios_localizacao"("expiraEm");
