import { Navigate, Outlet } from 'react-router-dom';
import type { Perfil } from '../api/types';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  perfis?: Perfil[];
}

/** RNF04: exige sessão válida e, opcionalmente, um dos perfis permitidos. */
export function ProtectedRoute({ perfis }: ProtectedRouteProps) {
  const { sessao } = useAuth();

  if (!sessao) {
    return <Navigate to="/login" replace />;
  }

  if (perfis && !perfis.includes(sessao.perfil)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
