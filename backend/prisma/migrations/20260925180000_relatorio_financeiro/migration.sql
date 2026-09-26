CREATE TYPE "TipoCombustivel" AS ENUM ('GASOLINA', 'DIESEL');
ALTER TABLE "usuarios" ADD COLUMN "tipoCombustivel" "TipoCombustivel";
ALTER TABLE "roteiros" ADD COLUMN "receitaBruta" DECIMAL(10,2);
