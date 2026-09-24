import { createContext, useContext, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import { getAccessToken, setAccessToken } from '../api/client';
import type { Sessao } from '../api/types';

const SESSAO_STORAGE_KEY = 'entregadores.sessao';

interface AuthContextValue {
  sessao: Sessao | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function lerSessaoArmazenada(): Sessao | null {
  if (!getAccessToken()) return null;
  const bruta = localStorage.getItem(SESSAO_STORAGE_KEY);
  return bruta ? (JSON.parse(bruta) as Sessao) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(lerSessaoArmazenada);

  async function login(email: string, senha: string) {
    const resposta = await authApi.login(email, senha);
    setAccessToken(resposta.accessToken);
    localStorage.setItem(SESSAO_STORAGE_KEY, JSON.stringify(resposta));
    setSessao(resposta);
  }

  function logout() {
    setAccessToken(null);
    localStorage.removeItem(SESSAO_STORAGE_KEY);
    setSessao(null);
  }

  return <AuthContext.Provider value={{ sessao, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de um AuthProvider.');
  }
  return contexto;
}
