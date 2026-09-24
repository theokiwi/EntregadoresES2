import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Painel } from './pages/Painel';
import { CadastroUnidade } from './pages/unidades/CadastroUnidade';
import { CadastroSupervisor } from './pages/supervisores/CadastroSupervisor';
import { Parametros } from './pages/parametros/Parametros';
import { GerenciarPerfis } from './pages/perfis/GerenciarPerfis';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute perfis={['SUPERVISOR_GERAL']} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Painel />} />
          <Route path="/unidades" element={<CadastroUnidade />} />
          <Route path="/supervisores" element={<CadastroSupervisor />} />
          <Route path="/parametros" element={<Parametros />} />
          <Route path="/perfis" element={<GerenciarPerfis />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
