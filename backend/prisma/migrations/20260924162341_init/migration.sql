-- CreateEnum
CREATE TYPE "Perfil" AS ENUM ('ENTREGADOR', 'SUPERVISOR_LOCAL', 'SUPERVISOR_GERAL');

-- CreateEnum
CREATE TYPE "RoteiroStatus" AS ENUM ('NAO_INICIADO', 'EM_ANDAMENTO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "ItemRoteiroStatus" AS ENUM ('PENDENTE', 'AGUARDANDO_SAIDA', 'CONCLUIDO');

-- CreateTable
CREATE TABLE "estabelecimentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estabelecimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "fusoHorario" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "unidadeId" TEXT,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "Perfil" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "documento" TEXT,
    "veiculo" TEXT,
    "rendimentoKmLitro" DECIMAL(10,2),
    "senhaDefinida" BOOLEAN NOT NULL DEFAULT false,
    "tokenConvite" TEXT,
    "tokenConviteExpiraEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametros" (
    "id" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "valorCombustivel" DECIMAL(10,2) NOT NULL,
    "custoPorKm" DECIMAL(10,2) NOT NULL,
    "jornadaPadraoHoras" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parametros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pontos" (
    "id" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pontos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roteiros" (
    "id" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "unidadeId" TEXT NOT NULL,
    "entregadorId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "status" "RoteiroStatus" NOT NULL DEFAULT 'NAO_INICIADO',
    "horaInicio" TIMESTAMP(3),
    "horaTermino" TIMESTAMP(3),
    "tempoTotalParadoMin" INTEGER,
    "distanciaTotalKm" DECIMAL(10,3),
    "custoEstimado" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roteiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_roteiro" (
    "id" TEXT NOT NULL,
    "roteiroId" TEXT NOT NULL,
    "pontoId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "horaChegada" TIMESTAMP(3),
    "horaSaida" TIMESTAMP(3),
    "tempoParadoMin" INTEGER,
    "status" "ItemRoteiroStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_roteiro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "itemRoteiroId" TEXT,
    "dataHoraCorrecao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entidade" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valorAnterior" TEXT NOT NULL,
    "valorNovo" TEXT NOT NULL,
    "justificativa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "unidades_estabelecimentoId_idx" ON "unidades"("estabelecimentoId");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_estabelecimentoId_nome_key" ON "unidades"("estabelecimentoId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_tokenConvite_key" ON "usuarios"("tokenConvite");

-- CreateIndex
CREATE INDEX "usuarios_unidadeId_idx" ON "usuarios"("unidadeId");

-- CreateIndex
CREATE INDEX "usuarios_estabelecimentoId_idx" ON "usuarios"("estabelecimentoId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "parametros_unidadeId_key" ON "parametros"("unidadeId");

-- CreateIndex
CREATE INDEX "pontos_unidadeId_idx" ON "pontos"("unidadeId");

-- CreateIndex
CREATE INDEX "roteiros_unidadeId_idx" ON "roteiros"("unidadeId");

-- CreateIndex
CREATE INDEX "roteiros_estabelecimentoId_idx" ON "roteiros"("estabelecimentoId");

-- CreateIndex
CREATE UNIQUE INDEX "roteiros_entregadorId_data_key" ON "roteiros"("entregadorId", "data");

-- CreateIndex
CREATE INDEX "itens_roteiro_pontoId_idx" ON "itens_roteiro"("pontoId");

-- CreateIndex
CREATE UNIQUE INDEX "itens_roteiro_roteiroId_ordem_key" ON "itens_roteiro"("roteiroId", "ordem");

-- CreateIndex
CREATE INDEX "auditoria_estabelecimentoId_idx" ON "auditoria"("estabelecimentoId");

-- CreateIndex
CREATE INDEX "auditoria_itemRoteiroId_idx" ON "auditoria"("itemRoteiroId");

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "unidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parametros" ADD CONSTRAINT "parametros_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontos" ADD CONSTRAINT "pontos_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roteiros" ADD CONSTRAINT "roteiros_unidadeId_fkey" FOREIGN KEY ("unidadeId") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roteiros" ADD CONSTRAINT "roteiros_entregadorId_fkey" FOREIGN KEY ("entregadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_roteiro" ADD CONSTRAINT "itens_roteiro_roteiroId_fkey" FOREIGN KEY ("roteiroId") REFERENCES "roteiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_roteiro" ADD CONSTRAINT "itens_roteiro_pontoId_fkey" FOREIGN KEY ("pontoId") REFERENCES "pontos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_itemRoteiroId_fkey" FOREIGN KEY ("itemRoteiroId") REFERENCES "itens_roteiro"("id") ON DELETE SET NULL ON UPDATE CASCADE;
