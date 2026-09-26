import { ForbiddenException } from '@nestjs/common';
import { PlanoAssinatura } from '../../generated/prisma/client';
import { AssinaturasService } from './assinaturas.service';

describe('AssinaturasService', () => {
  const assinatura = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };
  const unidade = { count: jest.fn(), create: jest.fn() };
  const usuario = { count: jest.fn(), create: jest.fn() };
  const prisma = {
    assinatura,
    unidade,
    usuario,
    estabelecimento: { create: jest.fn() },
    parametro: { create: jest.fn() },
  } as any;
  const service = new AssinaturasService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('oferece planos com valores e limites diferentes', () => {
    const planos = service.listarPlanos();
    expect(planos).toHaveLength(3);
    expect(new Set(planos.map((plano) => plano.valorMensal)).size).toBe(3);
    expect(
      planos.find((plano) => plano.codigo === PlanoAssinatura.PROFISSIONAL)
        ?.valorMensal,
    ).toBe(299);
  });

  it('impede criar entregadores acima do limite contratado', async () => {
    assinatura.findUnique.mockResolvedValue({
      plano: PlanoAssinatura.ESSENCIAL,
    });
    usuario.count.mockResolvedValue(5);
    await expect(
      service.validarNovoRecurso('empresa-1', 'entregador'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('permite recurso quando ainda há capacidade no plano', async () => {
    assinatura.findUnique.mockResolvedValue({
      plano: PlanoAssinatura.ESSENCIAL,
    });
    unidade.count.mockResolvedValue(0);
    await expect(
      service.validarNovoRecurso('empresa-1', 'unidade'),
    ).resolves.toBeUndefined();
  });
});
