import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Painel } from './pages/Painel';
import { CadastroEntregador } from './pages/entregadores/CadastroEntregador';
import { CadastroPonto } from './pages/pontos/CadastroPonto';
import { CadastroUnidade } from './pages/unidades/CadastroUnidade';
import { CadastroSupervisor } from './pages/supervisores/CadastroSupervisor';
import { Parametros } from './pages/parametros/Parametros';
import { GerenciarPerfis } from './pages/perfis/GerenciarPerfis';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Painel />} />

          <Route element={<ProtectedRoute perfis={['SUPERVISOR_GERAL']} />}>
            <Route path="/unidades" element={<CadastroUnidade />} />
            <Route path="/supervisores" element={<CadastroSupervisor />} />
            <Route path="/parametros" element={<Parametros />} />
            <Route path="/perfis" element={<GerenciarPerfis />} />
          </Route>

          <Route element={<ProtectedRoute perfis={['SUPERVISOR_LOCAL', 'SUPERVISOR_GERAL']} />}>
            <Route path="/entregadores" element={<CadastroEntregador />} />
            <Route path="/pontos" element={<CadastroPonto />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
