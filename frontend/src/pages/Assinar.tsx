import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import * as assinaturaApi from '../api/assinaturas';
import type { Plano, PlanoCodigo } from '../api/assinaturas';
import { mensagemDeErro } from '../api/error';
import { useAuth } from '../auth/AuthContext';
import { ErrorText, Icon, inputClass, PrimaryButton, SecondaryButton } from '../components/ui';

const iniciais = { empresaNome: '', unidadeNome: 'Matriz', endereco: '', administradorNome: '', email: '', senha: '', numeroCartao: '', cvv: '', validade: '' };

export function Assinar() {
  const { sessao, login } = useAuth();
  const [params] = useSearchParams();
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [plano, setPlano] = useState<PlanoCodigo>((params.get('plano') as PlanoCodigo) || 'PROFISSIONAL');
  const [etapa, setEtapa] = useState(1);
  const [form, setForm] = useState(iniciais);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => { assinaturaApi.listarPlanos().then(setPlanos).catch((e) => setErro(mensagemDeErro(e))); }, []);
  if (sessao) return <Navigate to="/" replace />;
  const selecionado = planos.find((item) => item.codigo === plano);
  const atualizar = (campo: keyof typeof form, valor: string) => setForm((atual) => ({ ...atual, [campo]: valor }));

  async function finalizar(evento: FormEvent) {
    evento.preventDefault(); setErro(null); setCarregando(true);
    try {
      await assinaturaApi.contratar({ ...form, plano, numeroCartao: form.numeroCartao.replace(/\D/g, '') });
      await login(form.email, form.senha);
    } catch (e) { setErro(mensagemDeErro(e)); } finally { setCarregando(false); }
  }

  return <div className="signup-shell">
    <header className="signup-header"><Link to="/login" className="brand compact"><span className="brand-mark"><Icon name="route"/></span><strong>Rota<span>Ágil</span></strong></Link><span>Já tem conta? <Link to="/login">Entrar</Link></span></header>
    <main className="signup-main">
      <div className="signup-progress" aria-label={`Etapa ${etapa} de 3`}><span className={etapa >= 1 ? 'active' : ''}>1. Plano</span><i/><span className={etapa >= 2 ? 'active' : ''}>2. Empresa</span><i/><span className={etapa >= 3 ? 'active' : ''}>3. Pagamento</span></div>
      {etapa === 1 && <section><p className="eyebrow text-center">Comece agora</p><h1>Um plano para cada fase da operação</h1><p className="signup-lead">Contrate online e configure sua empresa sem falar com o comercial.</p><div className="pricing-grid">{planos.map((item) => <button type="button" key={item.codigo} className={`pricing-card ${plano === item.codigo ? 'selected' : ''}`} onClick={() => setPlano(item.codigo)}>{item.destaque && <em>Mais escolhido</em>}<h2>{item.nome}</h2><div><strong>R$ {item.valorMensal}</strong><span>/mês</span></div><ul><li><Icon name="check"/> Até {item.limiteEntregadores} entregadores</li><li><Icon name="check"/> Até {item.limiteUnidades} {item.limiteUnidades === 1 ? 'unidade' : 'unidades'}</li><li><Icon name="check"/> Rotas, custos e dashboard</li><li><Icon name="check"/> Histórico e auditoria</li></ul><span className="plan-choice">{plano === item.codigo ? 'Plano selecionado' : 'Selecionar plano'}</span></button>)}</div><PrimaryButton className="signup-next" disabled={!selecionado} onClick={() => setEtapa(2)}>Continuar com {selecionado?.nome}</PrimaryButton></section>}
      {etapa === 2 && <form className="signup-form" onSubmit={(e) => { e.preventDefault(); setEtapa(3); }}><p className="eyebrow">Configuração inicial</p><h1>Conte sobre sua operação</h1><p className="signup-lead">Sua empresa, primeira unidade e acesso administrador serão criados automaticamente.</p><div className="form-grid"><label className="field"><span>Nome da empresa</span><input className={inputClass} required value={form.empresaNome} onChange={(e) => atualizar('empresaNome', e.target.value)}/></label><label className="field"><span>Nome da primeira unidade</span><input className={inputClass} required value={form.unidadeNome} onChange={(e) => atualizar('unidadeNome', e.target.value)}/></label><label className="field full"><span>Endereço da unidade</span><input className={inputClass} required value={form.endereco} onChange={(e) => atualizar('endereco', e.target.value)}/></label><label className="field"><span>Seu nome</span><input className={inputClass} required value={form.administradorNome} onChange={(e) => atualizar('administradorNome', e.target.value)}/></label><label className="field"><span>E-mail de acesso</span><input type="email" className={inputClass} required value={form.email} onChange={(e) => atualizar('email', e.target.value)}/></label><label className="field full"><span>Senha</span><input type="password" minLength={8} className={inputClass} required value={form.senha} onChange={(e) => atualizar('senha', e.target.value)}/><small>Mínimo de 8 caracteres.</small></label></div><div className="signup-actions"><SecondaryButton type="button" onClick={() => setEtapa(1)}>Voltar</SecondaryButton><PrimaryButton type="submit">Ir para pagamento</PrimaryButton></div></form>}
      {etapa === 3 && <form className="signup-form" onSubmit={finalizar}><p className="eyebrow">Checkout seguro · demonstração</p><h1>Confirme sua assinatura</h1><div className="mock-notice"><Icon name="shield"/><div><strong>Pagamento simulado</strong><p>Nenhuma cobrança real será feita. Use qualquer cartão fictício de 16 dígitos.</p></div></div><div className="checkout-summary"><span>Plano {selecionado?.nome}</span><strong>R$ {selecionado?.valorMensal},00/mês</strong></div><div className="form-grid"><label className="field full"><span>Número do cartão fictício</span><input inputMode="numeric" placeholder="4242 4242 4242 4242" minLength={16} maxLength={19} className={inputClass} required value={form.numeroCartao} onChange={(e) => atualizar('numeroCartao', e.target.value)}/></label><label className="field"><span>Validade</span><input placeholder="12/30" className={inputClass} required value={form.validade} onChange={(e) => atualizar('validade', e.target.value)}/></label><label className="field"><span>CVV fictício</span><input inputMode="numeric" minLength={3} maxLength={4} placeholder="123" className={inputClass} required value={form.cvv} onChange={(e) => atualizar('cvv', e.target.value)}/></label></div>{erro && <ErrorText>{erro}</ErrorText>}<p className="checkout-terms">Ao confirmar, você aceita os termos da demonstração. A renovação exibida também é simulada.</p><div className="signup-actions"><SecondaryButton type="button" onClick={() => setEtapa(2)}>Voltar</SecondaryButton><PrimaryButton type="submit" disabled={carregando}>{carregando ? 'Criando sua conta…' : 'Confirmar e acessar'}</PrimaryButton></div></form>}
    </main>
  </div>;
}
