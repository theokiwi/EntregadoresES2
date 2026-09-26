import { api } from './client';
import type { Roteiro } from './types';

export interface MontarRoteiroInput {
  entregadorId: string;
  data: string;
  pontoIds: string[];
  unidadeId?: string;
  receitaBruta?: number;
}

interface LocalizacaoAtual {
  desafioId: string;
  latitude: number;
  longitude: number;
  precisaoMetros: number;
  capturadaEm: string;
}

type TipoDesafio = 'INICIAR_ROTEIRO' | 'REGISTRAR_CHEGADA' | 'REGISTRAR_SAIDA';

async function criarDesafioLocalizacao(tipo: TipoDesafio, alvoId: string): Promise<string> {
  const { data } = await api.post<{ id: string }>('/roteiros/desafios-localizacao', {
    tipo,
    alvoId,
  });
  return data.id;
}

function obterLocalizacaoAtual(desafioId: string): Promise<LocalizacaoAtual> {
  if (!navigator.geolocation) {
    return Promise.reject(
      new Error('Este dispositivo não oferece localização. Use um aparelho com GPS.'),
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords, timestamp }) =>
        resolve({
          desafioId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          precisaoMetros: coords.accuracy,
          capturadaEm: new Date(timestamp).toISOString(),
        }),
      (erro) => {
        const mensagem =
          erro.code === erro.PERMISSION_DENIED
            ? 'Permita o acesso à localização para registrar o evento.'
            : 'Não foi possível obter uma localização precisa. Vá para uma área aberta e tente novamente.';
        reject(new Error(mensagem));
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
    );
  });
}

export async function montarRoteiro(input: MontarRoteiroInput): Promise<Roteiro> {
  const { data } = await api.post<Roteiro>('/roteiros', input);
  return data;
}

export async function consultarRoteiroDeHoje(): Promise<Roteiro | null> {
  const { data } = await api.get<{ roteiro: Roteiro | null }>('/roteiros/hoje');
  return data.roteiro;
}

export async function consultarRoteiroPorId(id: string): Promise<Roteiro> {
  const { data } = await api.get<Roteiro>(`/roteiros/${id}`);
  return data;
}

export async function iniciarRoteiro(roteiroId: string): Promise<Roteiro> {
  const desafioId = await criarDesafioLocalizacao('INICIAR_ROTEIRO', roteiroId);
  const localizacao = await obterLocalizacaoAtual(desafioId);
  const { data } = await api.post<Roteiro>(`/roteiros/${roteiroId}/iniciar`, localizacao);
  return data;
}

export async function finalizarRoteiro(roteiroId: string): Promise<Roteiro> {
  const { data } = await api.post<Roteiro>(`/roteiros/${roteiroId}/finalizar`);
  return data;
}

export async function registrarChegada(itemRoteiroId: string): Promise<Roteiro> {
  const desafioId = await criarDesafioLocalizacao('REGISTRAR_CHEGADA', itemRoteiroId);
  const localizacao = await obterLocalizacaoAtual(desafioId);
  const { data } = await api.post<Roteiro>(`/roteiros/itens/${itemRoteiroId}/chegada`, localizacao);
  return data;
}

export async function registrarSaida(itemRoteiroId: string): Promise<Roteiro> {
  const desafioId = await criarDesafioLocalizacao('REGISTRAR_SAIDA', itemRoteiroId);
  const localizacao = await obterLocalizacaoAtual(desafioId);
  const { data } = await api.post<Roteiro>(`/roteiros/itens/${itemRoteiroId}/saida`, localizacao);
  return data;
}
