import { Injectable } from '@nestjs/common';
import { Auditoria } from '../../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface RegistrarAuditoriaInput {
  estabelecimentoId: string;
  autorId: string;
  itemRoteiroId?: string | null;
  entidade: string;
  campo: string;
  valorAnterior: string;
  valorNovo: string;
  justificativa?: string | null;
}

/**
 * RepositorioAuditoria (modelo-projeto.puml). Registro imutável (RNF05) — só create/read,
 * nunca update/delete. A consulta da trilha (UC17) chega na Fase 5; aqui só o registro
 * usado por UC05.
 */
@Injectable()
export class AuditoriaRepository {
  constructor(private readonly prisma: PrismaService) {}

  registrar(input: RegistrarAuditoriaInput): Promise<Auditoria> {
    return this.prisma.auditoria.create({ data: input });
  }
}
