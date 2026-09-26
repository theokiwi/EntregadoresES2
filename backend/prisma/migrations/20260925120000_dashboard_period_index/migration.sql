-- UC18 / RNF03: acelera os recortes de dashboard e histórico por Unidade e período.
DROP INDEX IF EXISTS "roteiros_unidadeId_idx";
CREATE INDEX "roteiros_unidadeId_data_idx" ON "roteiros"("unidadeId", "data");
