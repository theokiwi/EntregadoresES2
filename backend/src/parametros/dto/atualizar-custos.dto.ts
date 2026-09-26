import { IsPositive, IsNumber } from 'class-validator';

export class AtualizarCustosDto {
  // UC03, passo 3: ambos os valores devem ser maiores que zero.
  @IsNumber()
  @IsPositive()
  valorCombustivel: number;

  @IsNumber()
  @IsPositive()
  custoPorKm: number;
}
