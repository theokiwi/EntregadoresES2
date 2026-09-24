import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { useAuth } from './auth/AuthContext';
import { Login } from './pages/Login';

function Home() {
  const { sessao } = useAuth();
  return <div className="p-6 text-slate-600">Bem-vindo(a), {sessao?.nome}.</div>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}
