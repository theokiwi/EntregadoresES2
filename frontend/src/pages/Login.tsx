import { useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { mensagemDeErro } from '../api/error';
import { useAuth } from '../auth/AuthContext';
import { ErrorText, Icon, inputClass, PrimaryButton } from '../components/ui';

/** UC00 — Autenticar-se: TelaLogin. */
export function Login() {
  const { sessao, login } = useAuth();
  const [searchParams] = useSearchParams();
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
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#ea1d2c] p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-32 -top-32 h-[430px] w-[430px] rounded-full border-[90px] border-white/10" />
        <div className="absolute -bottom-44 -left-24 h-[480px] w-[480px] rounded-full border-[110px] border-white/10" />
        <div className="relative flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#ea1d2c]"><Icon name="route"/></span><strong className="text-2xl tracking-tight">RotaÁgil</strong></div>
        <div className="relative max-w-lg"><p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-white/70">Operação inteligente</p><h2 className="text-5xl font-extrabold leading-[1.08] tracking-[-.05em]">Entregas no ritmo certo, do início ao fim.</h2><p className="mt-6 max-w-md text-base leading-7 text-white/80">Planeje rotas, acompanhe paradas e tome decisões melhores em um único lugar.</p></div>
        <p className="relative text-xs text-white/60">Gestão simples. Resultados visíveis.</p>
      </section>
      <section className="flex items-center justify-center bg-[#faf9f9] px-6 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-[390px]">
        <div className="mb-9 flex items-center gap-3 lg:hidden"><span className="brand-mark"><Icon name="route"/></span><strong className="text-xl">Rota<span className="text-[#ea1d2c]">Ágil</span></strong></div>
        <p className="eyebrow">Bem-vindo de volta</p>
        <h1 className="mb-2 mt-2 text-3xl font-extrabold tracking-[-.04em] text-stone-800">Acesse sua conta</h1>
        <p className="mb-8 text-sm text-stone-500">Entre com suas credenciais para continuar.</p>

        {searchParams.get('motivo') === 'sessao-expirada' && (
          <div className="mb-4"><ErrorText>Sua sessão expirou. Entre novamente para continuar.</ErrorText></div>
        )}

        <div className="flex flex-col gap-4">
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </label>
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={inputClass}
            />
          </label>

          {erro && <ErrorText>{erro}</ErrorText>}

          <PrimaryButton type="submit" disabled={carregando} className="mt-2 w-full">
            {carregando ? 'Entrando…' : 'Entrar'}
          </PrimaryButton>
          <p className="login-signup">Ainda não usa o RotaÁgil? <Link to="/assinar">Ver planos e assinar</Link></p>
        </div>
      </form></section>
    </div>
  );
}
