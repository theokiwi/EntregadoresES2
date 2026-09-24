import { NavLink, Outlet } from 'react-router-dom';
import type { Perfil } from '../api/types';
import { useAuth } from '../auth/AuthContext';

const LINKS: { to: string; label: string; perfis: Perfil[] }[] = [
  { to: '/entregadores', label: 'Entregadores', perfis: ['SUPERVISOR_LOCAL', 'SUPERVISOR_GERAL'] },
  { to: '/pontos', label: 'Pontos', perfis: ['SUPERVISOR_LOCAL', 'SUPERVISOR_GERAL'] },
  { to: '/unidades', label: 'Unidades', perfis: ['SUPERVISOR_GERAL'] },
  { to: '/supervisores', label: 'Supervisores', perfis: ['SUPERVISOR_GERAL'] },
  { to: '/parametros', label: 'Parâmetros', perfis: ['SUPERVISOR_GERAL'] },
  { to: '/perfis', label: 'Perfis de acesso', perfis: ['SUPERVISOR_GERAL'] },
];

export function Layout() {
  const { sessao, logout } = useAuth();
  const links = LINKS.filter((link) => sessao && link.perfis.includes(sessao.perfil));

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <span className="text-lg font-semibold text-slate-800">Entregadores</span>
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>{sessao?.nome}</span>
            <button onClick={logout} className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-100">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
