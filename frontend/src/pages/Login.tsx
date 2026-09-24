import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { mensagemDeErro } from '../api/error';
import { useAuth } from '../auth/AuthContext';
import { ErrorText, inputClass, PrimaryButton } from '../components/ui';

/** UC00 — Autenticar-se: TelaLogin. */
export function Login() {
  const { sessao, login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (sessao) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await login(email, senha);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-800">Entregadores</h1>
        <p className="mb-6 text-sm text-slate-500">Entre com seu e-mail e senha.</p>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Senha</span>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={inputClass}
            />
          </label>

          {erro && <ErrorText>{erro}</ErrorText>}

          <PrimaryButton type="submit" disabled={carregando}>
            {carregando ? 'Entrando…' : 'Entrar'}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
