import { BadRequestException } from '@nestjs/common';
import { UnidadeRepository } from '../repositorios/unidade.repository';
import { TenantContextService } from './tenant-context.service';

/**
 * Resolve a Unidade à qual um novo registro (Entregador, Ponto, ...) deve ser associado.
 * Supervisor local só opera a própria Unidade (ADR-001) — o valor informado no corpo da
 * requisição é ignorado. Supervisor geral não tem uma Unidade fixa (ADR-014) e por isso
 * precisa informá-la explicitamente, validada contra o próprio Estabelecimento (ADR-004).
 */
export async function resolverUnidadeAlvo(
  tenant: TenantContextService,
  unidades: UnidadeRepository,
  unidadeIdInformado?: string | null,
): Promise<string> {
  if (tenant.unidadeId) {
    return tenant.unidadeId;
  }
  if (!unidadeIdInformado) {
    throw new BadRequestException(
      'Unidade é obrigatória para Supervisor geral.',
    );
  }
  const unidade = await unidades.findById(
    tenant.estabelecimentoId,
    unidadeIdInformado,
  );
  if (!unidade) {
    throw new BadRequestException(
      'Unidade não pertence a este Estabelecimento.',
    );
  }
  return unidadeIdInformado;
}
