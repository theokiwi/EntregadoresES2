CREATE TYPE "PlanoAssinatura" AS ENUM ('ESSENCIAL', 'PROFISSIONAL', 'ESCALA');
CREATE TYPE "StatusAssinatura" AS ENUM ('ATIVA', 'CANCELADA');

CREATE TABLE "assinaturas" (
    "id" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "plano" "PlanoAssinatura" NOT NULL,
    "status" "StatusAssinatura" NOT NULL DEFAULT 'ATIVA',
    "valorMensal" DECIMAL(10,2) NOT NULL,
    "proximaCobranca" TIMESTAMP(3) NOT NULL,
    "pagamentoMock" BOOLEAN NOT NULL DEFAULT true,
    "cartaoFinal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "assinaturas_estabelecimentoId_key" ON "assinaturas"("estabelecimentoId");
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
