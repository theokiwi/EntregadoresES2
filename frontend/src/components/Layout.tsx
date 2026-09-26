import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { Perfil } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { Icon, PageHeader, type IconName } from './ui';

type LinkItem = { to: string; label: string; icon: IconName; perfis: Perfil[] };
const supervisores: Perfil[] = ['SUPERVISOR_LOCAL', 'SUPERVISOR_GERAL'];
const LINKS: Array<{ label: string; links: LinkItem[] }> = [
  { label: 'Visão geral', links: [
    { to: '/', label: 'Painel', icon: 'home', perfis: ['ENTREGADOR', ...supervisores] },
    { to: '/historico', label: 'Histórico', icon: 'history', perfis: ['ENTREGADOR', ...supervisores] },
  ]},
  { label: 'Operação', links: [
    { to: '/pedidos', label: 'Pedidos', icon: 'package', perfis: supervisores },
    { to: '/roteiros/montar', label: 'Planejar roteiro', icon: 'route', perfis: supervisores },
    { to: '/custos', label: 'Custos de rota', icon: 'money', perfis: supervisores },
    { to: '/entregadores', label: 'Entregadores', icon: 'users', perfis: supervisores },
    { to: '/pontos', label: 'Pontos de entrega', icon: 'pin', perfis: supervisores },
  ]},
  { label: 'Controle', links: [
    { to: '/correcoes', label: 'Corrigir registros', icon: 'edit', perfis: supervisores },
    { to: '/auditoria', label: 'Auditoria', icon: 'audit', perfis: supervisores },
  ]},
  { label: 'Administração', links: [
    { to: '/unidades', label: 'Unidades', icon: 'building', perfis: ['SUPERVISOR_GERAL'] },
    { to: '/supervisores', label: 'Supervisores', icon: 'shield', perfis: ['SUPERVISOR_GERAL'] },
    { to: '/parametros', label: 'Parâmetros', icon: 'settings', perfis: ['SUPERVISOR_GERAL'] },
    { to: '/perfis', label: 'Perfis de acesso', icon: 'users', perfis: ['SUPERVISOR_GERAL'] },
    { to: '/assinatura', label: 'Minha assinatura', icon: 'money', perfis: ['SUPERVISOR_GERAL'] },
  ]},
];

const PERFIL_LABEL: Record<Perfil, string> = {
  ENTREGADOR: 'Entregador', SUPERVISOR_LOCAL: 'Supervisor local', SUPERVISOR_GERAL: 'Supervisor geral',
};

const PAGE_TITLES: Record<string, string> = {
  '/': 'Painel', '/historico': 'Histórico', '/pedidos': 'Pedidos', '/roteiros/montar': 'Planejar roteiro',
  '/custos': 'Custos de rota', '/entregadores': 'Entregadores', '/pontos': 'Pontos de entrega',
  '/correcoes': 'Corrigir registros', '/auditoria': 'Auditoria', '/unidades': 'Unidades',
  '/supervisores': 'Supervisores', '/parametros': 'Parâmetros', '/perfis': 'Perfis de acesso',
  '/assinatura': 'Minha assinatura',
};
const PAGE_DESCRIPTIONS: Record<string, { eyebrow: string; description: string }> = {
  '/pedidos': { eyebrow: 'Operação', description: 'Registre os endereços que entrarão no planejamento de entregas.' },
  '/roteiros/montar': { eyebrow: 'Planejamento', description: 'Defina o entregador, a data e a ordem dos pontos da rota.' },
  '/entregadores': { eyebrow: 'Equipe', description: 'Cadastre entregadores e consulte a equipe disponível.' },
  '/pontos': { eyebrow: 'Operação', description: 'Cadastre e consulte os locais atendidos pela unidade.' },
  '/correcoes': { eyebrow: 'Controle', description: 'Localize uma rota e ajuste horários registrados incorretamente.' },
  '/auditoria': { eyebrow: 'Rastreabilidade', description: 'Consulte o histórico das correções realizadas no sistema.' },
  '/unidades': { eyebrow: 'Administração', description: 'Cadastre e consulte as unidades da operação.' },
  '/supervisores': { eyebrow: 'Administração', description: 'Cadastre responsáveis locais e envie o acesso inicial.' },
  '/parametros': { eyebrow: 'Configuração', description: 'Defina custos e regras de jornada para cada unidade.' },
  '/perfis': { eyebrow: 'Acesso', description: 'Localize usuários e ajuste suas permissões com segurança.' },
  '/assinatura': { eyebrow: 'Conta e cobrança', description: 'Consulte seu plano e faça alterações sem depender do atendimento.' },
};

export function Layout() {
  const { sessao, logout } = useAuth();
  const [aberto, setAberto] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'RotaÁgil';

  useEffect(() => {
    document.title = `${pageTitle} | RotaÁgil`;
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname, pageTitle]);

  useEffect(() => {
    if (!aberto) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setAberto(false); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [aberto]);

  return <div className="app-shell">
    <a className="skip-link" href="#conteudo-principal">Pular para o conteúdo principal</a>
    {aberto && <button type="button" className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setAberto(false)} />}
    <aside id="menu-principal" className={`sidebar ${aberto ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Icon name="route"/></span><div><strong>Rota<span>Ágil</span></strong><small>Gestão de entregas</small></div></div>
      <nav className="sidebar-nav" aria-label="Navegação principal">
        {LINKS.map((grupo) => {
          const links = grupo.links.filter((link) => sessao && link.perfis.includes(sessao.perfil));
          if (!links.length) return null;
          return <div className="nav-group" key={grupo.label}><p>{grupo.label}</p>{links.map((link) => <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setAberto(false)} className={({isActive}) => isActive ? 'active' : ''}><Icon name={link.icon}/><span>{link.label}</span></NavLink>)}</div>;
        })}
      </nav>
      <div className="sidebar-user">
        <div className="avatar">{sessao?.nome?.slice(0, 2).toUpperCase()}</div>
        <div><strong>{sessao?.nome}</strong><span>{sessao ? PERFIL_LABEL[sessao.perfil] : ''}</span></div>
        <button type="button" onClick={logout} title="Sair" aria-label="Sair da conta"><Icon name="logout"/></button>
      </div>
    </aside>
    <div className="app-content">
      <header className="mobile-header"><button type="button" onClick={() => setAberto(true)} aria-label="Abrir menu" aria-expanded={aberto} aria-controls="menu-principal"><Icon name="menu"/></button><div className="brand compact"><span className="brand-mark"><Icon name="route"/></span><strong>Rota<span>Ágil</span></strong></div><div className="avatar small" aria-hidden="true">{sessao?.nome?.slice(0, 2).toUpperCase()}</div></header>
      <main id="conteudo-principal" ref={mainRef} tabIndex={-1}>
        <span className="sr-only" role="status">Página {pageTitle}</span>
        {PAGE_DESCRIPTIONS[location.pathname] && <PageHeader title={pageTitle} {...PAGE_DESCRIPTIONS[location.pathname]} />}
        <Outlet />
      </main>
    </div>
  </div>;
}
