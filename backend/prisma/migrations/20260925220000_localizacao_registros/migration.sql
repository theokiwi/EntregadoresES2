ALTER TABLE "itens_roteiro"
  ADD COLUMN "chegadaLatitude" DECIMAL(9,6),
  ADD COLUMN "chegadaLongitude" DECIMAL(9,6),
  ADD COLUMN "chegadaPrecisaoMetros" DECIMAL(8,2),
  ADD COLUMN "chegadaCapturadaEm" TIMESTAMP(3),
  ADD COLUMN "saidaLatitude" DECIMAL(9,6),
  ADD COLUMN "saidaLongitude" DECIMAL(9,6),
  ADD COLUMN "saidaPrecisaoMetros" DECIMAL(8,2),
  ADD COLUMN "saidaCapturadaEm" TIMESTAMP(3);
