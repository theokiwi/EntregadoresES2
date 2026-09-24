import { isAxiosError } from 'axios';

export function mensagemDeErro(erro: unknown): string {
  if (isAxiosError(erro)) {
    const mensagem = erro.response?.data?.message;
    if (Array.isArray(mensagem)) return mensagem.join(' ');
    if (typeof mensagem === 'string') return mensagem;
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
