import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Painel } from './pages/Painel';
import { TrilhaDeAuditoria } from './pages/auditoria/TrilhaDeAuditoria';
import { CorrigirHorario } from './pages/correcoes/CorrigirHorario';
import { CadastroEntregador } from './pages/entregadores/CadastroEntregador';
import { CadastroPonto } from './pages/pontos/CadastroPonto';
import { CadastroUnidade } from './pages/unidades/CadastroUnidade';
import { RegistrarPedido } from './pages/pedidos/RegistrarPedido';
import { MontarRoteiro } from './pages/roteiros/MontarRoteiro';
import { CadastroSupervisor } from './pages/supervisores/CadastroSupervisor';
import { Parametros } from './pages/parametros/Parametros';
import { GerenciarPerfis } from './pages/perfis/GerenciarPerfis';
import { Historico } from './pages/Historico';
import { CustoRoteiro } from './pages/roteiros/CustoRoteiro';
import { Assinar } from './pages/Assinar';
import { MinhaAssinatura } from './pages/MinhaAssinatura';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/assinar" element={<Assinar />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Painel />} />
          <Route path="/historico" element={<Historico />} />

          <Route element={<ProtectedRoute perfis={['SUPERVISOR_GERAL']} />}>
            <Route path="/unidades" element={<CadastroUnidade />} />
            <Route path="/supervisores" element={<CadastroSupervisor />} />
            <Route path="/parametros" element={<Parametros />} />
            <Route path="/perfis" element={<GerenciarPerfis />} />
            <Route path="/assinatura" element={<MinhaAssinatura />} />
          </Route>

          <Route element={<ProtectedRoute perfis={['SUPERVISOR_LOCAL', 'SUPERVISOR_GERAL']} />}>
            <Route path="/entregadores" element={<CadastroEntregador />} />
            <Route path="/pontos" element={<CadastroPonto />} />
            <Route path="/pedidos" element={<RegistrarPedido />} />
            <Route path="/roteiros/montar" element={<MontarRoteiro />} />
            <Route path="/custos" element={<CustoRoteiro />} />
            <Route path="/correcoes" element={<CorrigirHorario />} />
            <Route path="/auditoria" element={<TrilhaDeAuditoria />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
