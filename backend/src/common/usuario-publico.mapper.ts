import { Usuario } from '../../generated/prisma/client';

/** Nunca expõe `senhaHash`/`tokenConvite` (constituição, item 5 — minimização de dados). */
export function paraUsuarioPublico(usuario: Usuario) {
  return {
    id: usuario.id,
    estabelecimentoId: usuario.estabelecimentoId,
    unidadeId: usuario.unidadeId,
    email: usuario.email,
    perfil: usuario.perfil,
    ativo: usuario.ativo,
    nome: usuario.nome,
    telefone: usuario.telefone,
    documento: usuario.documento,
    veiculo: usuario.veiculo,
    rendimentoKmLitro: usuario.rendimentoKmLitro,
    senhaDefinida: usuario.senhaDefinida,
    createdAt: usuario.createdAt,
  };
}
